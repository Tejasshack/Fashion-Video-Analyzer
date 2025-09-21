"use client";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* Main Heading */}
      <h1 className="text-5xl font-extrabold text-gray-800 mb-6 text-center">
        🎬 AI Video Analyzer
      </h1>

      {/* Description */}
      <p className="text-lg text-gray-600 mb-8 text-center max-w-xl">
        Analyze your videos quickly using AI: get key frames, object detection,
        transcripts, and summaries in a matter of seconds.
      </p>

      {/* Navigation to Analyzer Page */}
      <Link
        href="/video-analyzer"
        className="mb-10 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
      >
        🚀 Go to Video Analyzer
      </Link>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center">
          <Image
            src="/icons/frames.svg"
            alt="Key Frames"
            width={80}
            height={80}
          />
          <h3 className="text-xl font-semibold mt-4 mb-2">Key Frames</h3>
          <p className="text-gray-500 text-center">
            Automatically detect important scenes and sample frames for quick
            insights.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center">
          <Image
            src="/icons/objects.svg"
            alt="Object Detection"
            width={80}
            height={80}
          />
          <h3 className="text-xl font-semibold mt-4 mb-2">Object Detection</h3>
          <p className="text-gray-500 text-center">
            Identify objects in your video using YOLOv8 for fast and accurate
            results.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center">
          <Image
            src="/icons/transcript.svg"
            alt="Transcript"
            width={80}
            height={80}
          />
          <h3 className="text-xl font-semibold mt-4 mb-2">
            Transcript & Summary
          </h3>
          <p className="text-gray-500 text-center">
            Extract audio, transcribe speech, and generate concise summaries
            using AI.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-gray-400 text-sm text-center">
        &copy; 2025 Video Analyzer. All rights reserved.
      </footer>
    </div>
  );
}
