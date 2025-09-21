import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    // Save upload to tmp folder
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const videoPath = path.join(uploadDir, file.name);
    await fs.writeFile(videoPath, buffer);

    // Output JSON path
    const resultPath = path.join(uploadDir, file.name + ".json");

    const scriptPath = path.join(
      process.cwd(),
      "python_backend",
      "analyze_video_fast.py"
    );

    return new Promise((resolve, reject) => {
      const cmd = `python "${scriptPath}" "${videoPath}" "${resultPath}" cpu`; // use "cuda" if GPU available

      exec(cmd, { cwd: process.cwd() }, async (err, stdout, stderr) => {
        if (err) {
          console.error("Python error:", stderr);
          return resolve(
            new Response(JSON.stringify({ error: stderr }), { status: 500 })
          );
        }

        try {
          const json = JSON.parse(await fs.readFile(resultPath, "utf-8"));
          resolve(new Response(JSON.stringify(json), { status: 200 }));
        } catch (e) {
          console.error("Failed to parse output:", e);
          resolve(
            new Response(JSON.stringify({ error: "Bad JSON output" }), {
              status: 500,
            })
          );
        }
      });
    });
  } catch (err) {
    console.error("Route error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
    });
  }
}
