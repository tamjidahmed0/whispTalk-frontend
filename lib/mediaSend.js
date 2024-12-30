"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import action from "@/services/action";

export default async function mediaSend({ selectedFiles, receiverId, senderId, text, types, audioBlob }) {
  const formData = new FormData();

  if (types === "image") {
    // Append images to FormData
    selectedFiles.forEach((file) => formData.append("images", file));
  } else if (types === "voice") {
    // Append audio files to FormData
    formData.append("audio", audioBlob)
  }

  // Append additional JSON data
  formData.append(
    "jsonData",
    JSON.stringify({
      receiverId,
      senderId,
      text,
      types,
    })
  );

  try {
    // Dynamic API endpoint based on type
    const apiEndpoint = `${process.env.NEXT_PUBLIC_API}/api/mediaUpload/${senderId}`;

    const result = await fetch(apiEndpoint, {
      method: "POST",
      body: formData,
    });

    if (result.ok) {
      // Handle successful upload
      return result.json();
    } else {
      // Handle error response
      const errorResponse = await result.json();
      console.error("Upload error:", errorResponse);
      return errorResponse;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return { error: "An error occurred while uploading media." };
  }
}
