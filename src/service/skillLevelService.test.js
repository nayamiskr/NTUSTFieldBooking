import api from "../baseApi.js";
import { skillLevelService } from "./skillLevelService";

jest.mock("../baseApi.js", () => ({
  __esModule: true,
  default: { put: jest.fn() },
}));

test("submits the skill_level field required by the profile API", async () => {
  api.put.mockResolvedValue({ data: { skill_level: 2 } });

  await skillLevelService.setMyLevel("sport-123", 2);

  expect(api.put).toHaveBeenCalledWith("/me/skill-levels/sport-123", { skill_level: 2 });
});
