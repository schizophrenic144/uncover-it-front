"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Mail, Globe } from "lucide-react";
import "../cursor.css";

// Navbar Component
function Navbar() {
  return (
    <nav className="sticky top-10 z-10 mx-auto max-w-3xl mt-0">
      <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-full px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center justify-between w-full">
            <Link href="/" className="flex-shrink-0">
              <span className="text-lg font-bold">Uncover it</span>
            </Link>
            <div className="flex items-baseline space-x-4">
              <Link
                href="/"
                className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="https://discord.gg/qmF4END38T"
                className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                target="_blank"
              >
                Discord
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

const developers = [
  {
    name: "144",
    role: "Backend Developer",
    bio: "idk",
    github: "https://github.com/schizophrenic144",
    avatar: "https://cdn.discordapp.com/avatars/1034370922599157831/1034b079fe3542f2c87e955d79ddd3d8.webp?size=1024?height=100&width=100"
  },
  {
    name: "WarFiN",
    role: "Fullstack Developer",
    bio: "Small developer from India",
    github: "https://github.com/warfin123",
    website: "https://warfin.us.kg",
    email: "mail@warfin.us.kg",
    avatar: "https://github.com/WarFiN123/warfin.us.kg/blob/dcd7e92bc34e1f37a463aa39717b4fccedf473bc/public/favicon.png?raw=true?height=100&width=100"
  },
];

export default function AboutPage() {
  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.classList.add("custom-cursor", "expanded");
    document.body.appendChild(cursor);
  
    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.pageX}px`;
      cursor.style.top = `${e.pageY}px`;
    };
  
    const handleMouseOver = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("a, button, input, .clickable")) {
        cursor.classList.remove("expanded");
        cursor.classList.add("contracted");
      } else {
        cursor.classList.remove("contracted");
        cursor.classList.add("expanded");
      }
    };
  
    const handleClick = () => {
      cursor.classList.add("clicked");
      setTimeout(() => {
        cursor.classList.remove("clicked");
      }, 100);
    };
  
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("click", handleClick);
  
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("click", handleClick);
      document.body.removeChild(cursor);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-12">
        <h1 className="text-3xl font-bold mb-6 text-center">About Our Team</h1>
        
        <p className="text-center mb-8">
          We are a dedicated team of developers passionate about creating a better world.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {developers.map((dev, index) => (
            <Card key={index}>
              <CardHeader>
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={dev.avatar} alt={dev.name} />
                  <AvatarFallback>{dev.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-center">{dev.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold mb-2 text-center">{dev.role}</p>
                <p className="text-sm text-gray-600 mb-4 text-center">{dev.bio}</p>
              </CardContent>
              <CardFooter className="flex justify-center space-x-4">
                <a href={dev.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </a>
                {dev.website && (
                  <a href={dev.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">Website</span>
                  </a>
                )}
                {dev.email && (
                  <a href={`mailto:${dev.email}`} className="text-gray-600 hover:text-gray-900">
                    <Mail className="h-5 w-5" />
                    <span className="sr-only">Email</span>
                  </a>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}