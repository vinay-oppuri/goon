import { inngest } from "@/inngest/client";

import {Sandbox} from "@e2b/code-interpreter"

import { createAgent, gemini } from "@inngest/agent-kit";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("goon-nextjs-test-3")
      return sandbox.sandboxId
    })

    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert next.js developer. You write readable, maintainable code, You write simple Next.js & React snippets",
      model: gemini({ model: "gemini-2.0-flash" }),
    });

    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.value}`
    );

    const sandboxUrl = await step.run("get-sanbox-url", async () => {
      const sandbox = getSandbox(sandboxId)
      const host = (await sandbox).getHost(3000)
      return `http://${host}`
    })

    return { output, sandboxUrl };
  }
);
