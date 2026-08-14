type CognitoErrorCandidate = {
  message?: unknown;
  name?: unknown;
};

function getCognitoError(error: unknown): CognitoErrorCandidate | null {
  return typeof error === "object" && error !== null
    ? (error as CognitoErrorCandidate)
    : null;
}

export function isAlreadyConfirmedCognitoError(error: unknown): boolean {
  const candidate = getCognitoError(error);

  return (
    candidate?.name === "NotAuthorizedException" &&
    typeof candidate.message === "string" &&
    candidate.message.toLowerCase().includes("confirmed")
  );
}

export function getConfirmationErrorMessage(error: unknown): string {
  const name = getCognitoError(error)?.name;

  if (name === "CodeMismatchException") {
    return "El código de confirmación no es válido.";
  }

  if (name === "ExpiredCodeException") {
    return "El código ha caducado. Solicita uno nuevo e inténtalo otra vez.";
  }

  return "No pudimos confirmar tu cuenta. Revisa el código e inténtalo de nuevo.";
}
