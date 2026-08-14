import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { config } from "../config";

export interface ProcessTranscriptionInvocation {
  transcriptionId: string;
  userId: string;
}

export interface TranscriptionProcessingDispatcherPort {
  dispatch(input: ProcessTranscriptionInvocation): Promise<void>;
}

/** Dispatches transcription work without holding the API request open. */
export class LambdaTranscriptionProcessingDispatcher
  implements TranscriptionProcessingDispatcherPort
{
  private readonly client: LambdaClient;

  constructor(client: LambdaClient = new LambdaClient({ region: config.awsRegion })) {
    this.client = client;
  }

  async dispatch(input: ProcessTranscriptionInvocation): Promise<void> {
    const functionName = config.processTranscriptionFunctionName;

    if (!functionName) {
      throw new Error("Process transcription function is not configured");
    }

    await this.client.send(
      new InvokeCommand({
        FunctionName: functionName,
        InvocationType: "Event",
        Payload: Buffer.from(JSON.stringify(input)),
      }),
    );
  }
}

export const transcriptionProcessingDispatcher =
  new LambdaTranscriptionProcessingDispatcher();
