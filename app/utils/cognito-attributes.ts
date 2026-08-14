import type {
  CognitoNameParts,
  CognitoSignUpProfile,
  CognitoRequiredSignUpAttributes,
} from "~/common/types";

const DEFAULT_COGNITO_GENDER = "unspecified";
const DEFAULT_COGNITO_MIDDLE_NAME = "-";
const DEFAULT_COGNITO_PICTURE_URL = "https://vocali.app/avatar.png";
const DEFAULT_COGNITO_PROFILE_URL = "https://vocali.app/profile";

function getUnixTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

export function getCognitoNameParts(fullName: string): CognitoNameParts {
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const formattedName = nameParts.join(" ");
  const familyName = nameParts.at(-1) ?? formattedName;
  const middleName =
    nameParts.length > 2
      ? nameParts.slice(1, -1).join(" ")
      : DEFAULT_COGNITO_MIDDLE_NAME;

  return {
    familyName,
    formattedName,
    middleName,
  };
}

export function createCognitoSignUpAttributes({
  email,
  fullName,
}: CognitoSignUpProfile): CognitoRequiredSignUpAttributes {
  const nameParts = getCognitoNameParts(fullName);

  return {
    email,
    family_name: nameParts.familyName,
    gender: DEFAULT_COGNITO_GENDER,
    middle_name: nameParts.middleName,
    name: nameParts.formattedName,
    picture: DEFAULT_COGNITO_PICTURE_URL,
    profile: DEFAULT_COGNITO_PROFILE_URL,
    updated_at: getUnixTimestamp(),
  };
}
