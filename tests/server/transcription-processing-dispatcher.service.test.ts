import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { LambdaTranscriptionProcessingDispatcher } from "../../server/services/transcription-processing-dispatcher.service";

describe("LambdaTranscriptionProcessingDispatcher", () => {
  beforeEach(() => {
    process.env.PROCESS_TRANSCRIPTION_FUNCTION_NAME = "vocali-process-transcription";
  });
  it("invokes the processor asynchronously with only the record identity", async () => {
    const send = jest.fn().mockResolvedValue({});
    const client = { send } as unknown as LambdaClient;
    const dispatcher = new LambdaTranscriptionProcessingDispatcher(client);

    await dispatcher.dispatch({ transcriptionId: "transcription-123", userId: "user-123" });

    expect(send).toHaveBeenCalledWith(expect.any(InvokeCommand));
    expect((send.mock.calls[0]?.[0] as InvokeCommand).input).toMatchObject({
      InvocationType: "Event",
    });
  });
});
