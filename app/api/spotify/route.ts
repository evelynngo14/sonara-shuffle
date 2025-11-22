import { NextResponse } from "next/server";
import getRandomSong from "@/app/lib/spotify"; // your helper

export async function POST(req: Request) {
  try {
    const { genre, decade } = await req.json();

    const track = await getRandomSong({
      genre,
      // decade should be passed as a tuple [minYear, maxYear]
      decade: decade.includes("-")
        ? decade.split("-").map(Number) as [number, number]
        : decade,
    });

    return NextResponse.json(track);
  } catch (error: any) {
    console.error("Spotify API error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
