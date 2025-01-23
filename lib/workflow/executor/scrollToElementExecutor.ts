import { ExecutionEnvironment } from "@/types/executor";
import { ScrollToELementTask } from "../task/ScrollElement";

export async function ScrollToELementExecutor(
  environment: ExecutionEnvironment<typeof ScrollToELementTask>
): Promise<boolean> {
  try {
    const selector = environment.getInput("Selector");
    if (!selector) {
      environment.log.error("input->Selector is not defined");
    }

    await environment.getPage()!.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error("element not found");
      }
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top });
    }, selector);
    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}
