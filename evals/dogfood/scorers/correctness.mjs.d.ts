export function evaluateCorrectnessParts(parts: {
  acceptancePass: boolean;
  specAlignmentPass: boolean;
  dirtyScopePass: boolean;
  details: string[];
}): {
  acceptancePass: boolean;
  specAlignmentPass: boolean;
  dirtyScopePass: boolean;
  details: string[];
  valid: boolean;
};

export function scoreCorrectness(args: { worktreeRoot: string; taskDir: string }): {
  acceptancePass: boolean;
  specAlignmentPass: boolean;
  dirtyScopePass: boolean;
  details: string[];
  valid: boolean;
};
