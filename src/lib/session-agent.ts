import { privateKeyToAccount } from "viem/accounts";
import type { AbstractWallet } from "@nktkas/hyperliquid/signing";
import {
  approveHyperliquidAgent,
  fetchHyperliquidAgentApproval,
  type HyperliquidAgentApproval,
} from "@/lib/hyperliquid";

const PRIVATE_KEY_STORAGE_KEY = "hlout.sessionAgent.privateKey";
const APPROVALS_STORAGE_KEY = "hlout.sessionAgent.approvals";
const APPROVAL_DURATION_MS = 60 * 60 * 1000;
const APPROVAL_CHECK_RETRIES = 4;
const APPROVAL_CHECK_RETRY_MS = 400;

type AgentApproval = {
  agentAddress: `0x${string}`;
  approvedUntil: number;
};

type AgentApprovalMap = Record<string, AgentApproval>;

function randomPrivateKey(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function ownerKey(ownerAddress: `0x${string}`) {
  return ownerAddress.toLowerCase();
}

function readApprovals(): AgentApprovalMap {
  const storedApprovals = sessionStorage.getItem(APPROVALS_STORAGE_KEY);

  if (!storedApprovals) {
    return {};
  }

  try {
    const approvals = JSON.parse(storedApprovals) as AgentApprovalMap;

    if (!approvals || typeof approvals !== "object") {
      return {};
    }

    return approvals;
  } catch {
    return {};
  }
}

function writeApprovals(approvals: AgentApprovalMap) {
  sessionStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(approvals));
}

function cacheSessionAgentApproval(
  ownerAddress: `0x${string}`,
  agentAddress: `0x${string}`,
  approvedUntil: number,
) {
  const approvals = readApprovals();

  approvals[ownerKey(ownerAddress)] = {
    agentAddress,
    approvedUntil,
  };

  writeApprovals(approvals);
}

function clearSessionAgentApproval(ownerAddress: `0x${string}`) {
  const approvals = readApprovals();
  delete approvals[ownerKey(ownerAddress)];
  writeApprovals(approvals);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findActiveAgentApproval(
  ownerAddress: `0x${string}`,
  agentAddress: `0x${string}`,
  retries = 1,
) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const approval = await fetchHyperliquidAgentApproval(
      ownerAddress,
      agentAddress,
    );

    if (approval) {
      return approval;
    }

    if (attempt < retries - 1) {
      await wait(APPROVAL_CHECK_RETRY_MS);
    }
  }

  return null;
}

export function getOrCreateSessionAgent() {
  let privateKey = sessionStorage.getItem(PRIVATE_KEY_STORAGE_KEY) as
    | `0x${string}`
    | null;

  if (!privateKey) {
    privateKey = randomPrivateKey();
    sessionStorage.setItem(PRIVATE_KEY_STORAGE_KEY, privateKey);
  }

  return privateKeyToAccount(privateKey);
}

export function getSessionAgentApproval(
  ownerAddress: `0x${string}`,
  agentAddress: `0x${string}`,
) {
  const approval = readApprovals()[ownerKey(ownerAddress)];

  if (
    approval?.agentAddress.toLowerCase() === agentAddress.toLowerCase() &&
    Number.isFinite(approval.approvedUntil) &&
    approval.approvedUntil > Date.now()
  ) {
    return approval.approvedUntil;
  }

  return null;
}

export function createSessionAgentName(
  approvedUntil = Date.now() + APPROVAL_DURATION_MS,
) {
  return `hlout valid_until ${approvedUntil}`;
}

export function markSessionAgentApproved(
  ownerAddress: `0x${string}`,
  agentAddress: `0x${string}`,
  agentName: string,
) {
  const match = agentName.match(/ valid_until (\d+)$/);
  const approvedUntil = match
    ? Number(match[1])
    : Date.now() + APPROVAL_DURATION_MS;
  cacheSessionAgentApproval(ownerAddress, agentAddress, approvedUntil);

  return approvedUntil;
}

function toApprovedSessionAgent(
  agent: ReturnType<typeof getOrCreateSessionAgent>,
  approval: HyperliquidAgentApproval,
  approvedNow: boolean,
) {
  return {
    approvedNow,
    approvedUntil: approval.validUntil,
    agent,
  };
}

export async function ensureApprovedSessionAgent(
  masterWallet: AbstractWallet,
  ownerAddress: `0x${string}`,
) {
  const sessionAgent = getOrCreateSessionAgent();

  const activeApproval = await findActiveAgentApproval(
    ownerAddress,
    sessionAgent.address,
  );

  if (activeApproval) {
    cacheSessionAgentApproval(
      ownerAddress,
      sessionAgent.address,
      activeApproval.validUntil,
    );

    return toApprovedSessionAgent(sessionAgent, activeApproval, false);
  }

  clearSessionAgentApproval(ownerAddress);

  const expectedApprovedUntil = Date.now() + APPROVAL_DURATION_MS;
  const agentName = createSessionAgentName(expectedApprovedUntil);

  await approveHyperliquidAgent(masterWallet, sessionAgent.address, agentName);

  const confirmedApproval = await findActiveAgentApproval(
    ownerAddress,
    sessionAgent.address,
    APPROVAL_CHECK_RETRIES,
  );

  if (!confirmedApproval) {
    throw new Error(
      "The session wallet was approved, but Hyperliquid did not report it as active yet. Try again in a moment.",
    );
  }

  markSessionAgentApproved(ownerAddress, sessionAgent.address, agentName);
  cacheSessionAgentApproval(
    ownerAddress,
    sessionAgent.address,
    confirmedApproval.validUntil,
  );

  return toApprovedSessionAgent(sessionAgent, confirmedApproval, true);
}
