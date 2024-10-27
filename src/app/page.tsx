"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Skull } from "lucide-react"; // Import Skull icon
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Upload,
  File,
  BarChart2,
  FileText,
  Calendar,
  HardDrive,
  Eye,
} from "lucide-react";
import "./cursor.css";
import { Button } from "@/components/ui/button"; // Import Button from shadcn

// Define a custom type that extends the File interface
interface ExtendedFile extends File {
  status?: string;
  sha256?: string;
  tag?: string;
  family?: string;
  config?: string;
}

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

export default function FileUploadHomepage() {
  const [files, setFiles] = useState<ExtendedFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<ExtendedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // New state for error message
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false); // State for config dialog

  const cursorRef = useRef<HTMLDivElement | null>(null); // Create a ref for the cursor

  useEffect(() => {
    if (!cursorRef.current) {
      const cursor = document.createElement("div");
      cursor.classList.add("custom-cursor", "expanded");
      document.body.appendChild(cursor);
      cursorRef.current = cursor;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.pageX}px`;
        cursorRef.current.style.top = `${e.pageY}px`;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (cursorRef.current) {
        if (
          e.target instanceof HTMLElement &&
          e.target.closest("a, button, input, .clickable")
        ) {
          cursorRef.current.classList.remove("expanded");
          cursorRef.current.classList.add("contracted");
        } else {
          cursorRef.current.classList.remove("contracted");
          cursorRef.current.classList.add("expanded");
        }
      }
    };

    const handleClick = () => {
      if (cursorRef.current) {
        cursorRef.current.classList.add("clicked");
        setTimeout(() => {
          cursorRef.current?.classList.remove("clicked");
        }, 100);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("click", handleClick);
      if (cursorRef.current && document.body.contains(cursorRef.current)) {
        document.body.removeChild(cursorRef.current);
        cursorRef.current = null;
      }
    };
  }, []); // Empty dependency array to ensure it runs only once

  const calculateSha256 = async (file: ExtendedFile) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      return hashHex;
    } catch (error) {
      console.log("Failed to calculate hash", error);
      return undefined;
    }
  };

  useEffect(() => {
    if (selectedFile) {
      getSampleData(selectedFile);
    }
  }, [selectedFile]);

  function formatConfig(config: string): string {
    return config.replace(/<br>/g, "\n");
  }

  const getSampleData = async (selected: ExtendedFile) => {
    try {
      selected.status = "In Progress";
      const response = await fetch(
        `https://api.uncover.us.kg/sample/${selected.sha256}`
      );
      if (!response.ok) {
        selected.status = "Failed!";
        setErrorMessage("API is down or unreachable.");
        console.warn("API response was not ok:", response.statusText);
        return;
      }
      const data = await response.json();
      selected.tag = data.tag;
      selected.family = data.family;
      selected.config = formatConfig(data.config);
      selected.tag = data.tag;
      selected.status = "Success!";
    } catch (error) {
      selected.status = "Failed!";
      setErrorMessage("API is down or unreachable.");
      console.error("Error fetching data:", error);
    }
  };

  const handleFileUpload = async (fileList: FileList) => {
    if (fileList.length === 0) {
      setErrorMessage("You need to pick a file to upload.");
      return;
    }

    const newFiles = Array.from(fileList) as ExtendedFile[];
    const validFiles = newFiles.filter((file) => {
      if (!file.name.endsWith(".exe")) {
        setErrorMessage("Only executables (.exe) files are supported.");
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        // Check if file size is greater than 100MB
        setErrorMessage("File size exceeds the 100MB limit.");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      return;
    }

    validFiles.forEach((file) => (file.status = "In Progress"));
    setFiles((prevFiles) => [...prevFiles, ...validFiles]);

    const sha256Hash = await calculateSha256(validFiles[0]);
    validFiles[0].sha256 = sha256Hash;
    try {
      const sha256Response = await fetch(`https://api.uncover.us.kg/hash`, {
        method: "POST",
        body: JSON.stringify({ "256": sha256Hash }),
        headers: { "Content-Type": "application/json" },
      });
      const sha256Data = await sha256Response.json();
      if (!sha256Data.exists) {
        const formData = new FormData();
        if (sha256Hash) {
          formData.append("file", validFiles[0]);
          formData.append("256", sha256Hash);
        }
        const response = await fetch(`https://api.uncover.us.kg/upload`, {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          if (data.message === "Done") {
            validFiles[0].status = "Success!";
          } else {
            validFiles[0].status = "Failed!";
          }
        } else {
          validFiles[0].status = "Failed!";
        }
      } else {
        validFiles[0].status = "Success!";
      }
    } catch (error) {
      validFiles[0].status = "Failed!";
      setErrorMessage("API is down or unreachable.");
      console.error("Error during file upload:", error);
    }
    setFiles((prevFiles) => [...prevFiles]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileUpload(event.target.files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileUpload(event.dataTransfer.files);
  };

  const handleDragEnter = () => setIsDragging(true);
  const handleDragLeave = () => setIsDragging(false);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fileAnalysis = useMemo(() => {
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const averageSize = files.length > 0 ? totalSize / files.length : 0;

    // Provide an initial value with both 'size' and 'name' properties
    const largestFile = files.reduce(
      (largest, file) => (file.size > largest.size ? file : largest),
      { size: 0, name: "N/A" }
    );
    const smallestFile = files.reduce(
      (smallest, file) => (file.size < smallest.size ? file : smallest),
      { size: Infinity, name: "N/A" }
    );

    return {
      totalSize: (totalSize / (1024 * 1024)).toFixed(2),
      averageSize: (averageSize / (1024 * 1024)).toFixed(2),
      largestFile: largestFile.name
        ? `${largestFile.name} (${(largestFile.size / (1024 * 1024)).toFixed(2)} MB)`
        : "N/A",
      smallestFile: smallestFile.name
        ? `${smallestFile.name} (${(smallestFile.size / (1024 * 1024)).toFixed(2)} MB)`
        : "N/A",
    };
  }, [files]);

  const handleFileClick = (file: ExtendedFile) => {
    if (file.status === "Success!") {
      setSelectedFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-12">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Malware Analysis Dashboard
        </h1>

        <div className="mb-6">
          <Label htmlFor="search" className="sr-only">
            Search files
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              id="search"
              placeholder="Search files..."
              className="pl-8 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div
          className={`mb-6 ${
            isDragging ? "border-4 border-dashed border-blue-500" : ""
          } clickable`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <Card>
            <CardContent
              className="p-6 flex flex-col items-center justify-center clickable"
              onClick={() => {
                const fileUploadElement =
                  document.getElementById("file-upload");
                if (fileUploadElement) {
                  fileUploadElement.click();
                } else {
                  console.error("File upload element not found.");
                }
              }}
            >
              <Label
                htmlFor="file-upload"
                className="cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-lg font-semibold">Upload Files</span>
                  <span className="text-sm text-muted-foreground">
                    Drag & drop or click to select
                  </span>
                </div>
              </Label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleInputChange}
                multiple
              />
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="mr-2 h-4 w-4" />
                File Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Total Size:</p>
                  <p className="text-lg">{fileAnalysis.totalSize} MB</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Average Size:</p>
                  <p className="text-lg">{fileAnalysis.averageSize} MB</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Largest File:</p>
                  <p className="text-lg truncate">{fileAnalysis.largestFile}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Smallest File:</p>
                  <p className="text-lg truncate">
                    {fileAnalysis.smallestFile}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Uploaded Files</h2>
          <span className="text-sm text-muted-foreground">
            {files.length} file(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow duration-200 clickable"
              onClick={() => handleFileClick(file)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start space-x-3 flex-grow min-w-0">
                  <File className="h-8 w-8 text-muted-foreground flex-shrink-0 mt-1" />
                  <div className="flex-grow min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-white-200 border border-black-300 rounded-md">
                  {file.status === "In Progress" ? (
                    <div className="spinner"></div>
                  ) : file.status === "Failed!" ? (
                    <X className="h-5 w-5 text-red-500" /> // Show 'cross' icon for failed status
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog
          open={!!selectedFile}
          onOpenChange={() => setSelectedFile(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>File Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected file.
              </DialogDescription>
            </DialogHeader>
            {selectedFile && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <div className="flex-grow min-w-0 overflow-hidden">
                    <p className="font-medium break-words overflow-wrap truncate">
                      {selectedFile.name.length > 30
                        ? `${selectedFile.name.substring(0, 30)}...`
                        : selectedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-wrap">Status:</span>
                  </div>
                  <div className="text-sm text-wrap">
                    {selectedFile.status || "In Progress"}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-wrap">Last Modified:</span>
                  </div>
                  <div className="text-sm text-wrap">
                    {new Date(selectedFile.lastModified).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-wrap">File Type:</span>
                  </div>
                  <div className="text-sm text-wrap">
                    {selectedFile.type || "Unknown"}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-wrap">Malware Family:</span>
                  </div>
                  <div className="text-sm text-wrap">
                    {selectedFile.family || "Unknown"}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-wrap">Malware Type:</span>
                  </div>
                  <div className="text-sm text-wrap">
                    {selectedFile.tag || "Unknown"}
                  </div>
                </div>
                <Button
                  className="text-white"
                  onClick={() => setIsConfigDialogOpen(true)}
                >
                  <Skull className="h-5 w-5" />
                  Malware config
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="max-w-4xl h-[80vh]">
            {" "}
            {/* Adjusted size */}
            <DialogHeader>
              <DialogTitle>Malware Config</DialogTitle>
            </DialogHeader>
            <div className="p-4 overflow-auto h-full">
              <pre className="whitespace-pre-wrap">
                {selectedFile?.config || "No config available"}
              </pre>
            </div>
          </DialogContent>
        </Dialog>

        {errorMessage && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-center py-3 px-6 rounded-lg shadow-lg flex items-center justify-between w-11/12 sm:w-3/4 md:w-1/2 lg:max-w-md">
            <span>{errorMessage}</span>
            <button
              className="ml-4 bg-red-700 hover:bg-red-800 rounded-full p-1 transition-colors clickable"
              onClick={() => setErrorMessage("")}
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-center">
        <Link
          href="https://docs.google.com/spreadsheets/d/1ZBZtseZf7AM3aCEWG6Ar_V0NXNWmz42aDonaYEwsd5Q/edit?usp=sharing"
          passHref
        >
          <Button className="text-black bg-white shadow-md hover:bg-white/80 hover:shadow-lg">
            Supported Malware
          </Button>
        </Link>
      </div>
    </div>
  );
}
