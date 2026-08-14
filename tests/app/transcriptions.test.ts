import { TRANSCRIPTIONS_POLL_INTERVAL_MS } from "../../app/utils/constants";
import {
  containsProcessingTranscription,
  mapApiTranscriptionToListItem,
} from "../../app/utils/transcriptions";

describe("transcription presentation helpers", () => {
  it("polls processing transcriptions every 10 seconds", () => {
    expect(TRANSCRIPTIONS_POLL_INTERVAL_MS).toBe(10_000);
  });

  it("maps API transcription statuses into table statuses", () => {
    expect(
      mapApiTranscriptionToListItem({
        createdAt: "2026-08-14T10:00:00.000Z",
        fileName: "consulta.mp3",
        id: "transcription-1",
        status: "pending",
        type: "file",
      }),
    ).toMatchObject({
      id: "transcription-1",
      name: "consulta.mp3",
      status: "processing",
      type: "file",
    });
  });

  it("detects when a page requires background polling", () => {
    expect(
      containsProcessingTranscription([
        {
          createdAt: "2026-08-14T10:00:00.000Z",
          id: "transcription-1",
          name: "consulta.mp3",
          status: "processing",
          type: "file",
        },
      ]),
    ).toBe(true);

    expect(
      containsProcessingTranscription([
        {
          createdAt: "2026-08-14T10:00:00.000Z",
          id: "transcription-2",
          name: "consulta.txt",
          status: "completed",
          type: "realtime",
        },
      ]),
    ).toBe(false);
  });
});
