"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Upload, File, BarChart2, FileText, Calendar, HardDrive } from "lucide-react"

export default function FileUploadHomepage() {
  const [files, setFiles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileUpload = (fileList) => {
    const newFiles = Array.from(fileList)
    const validFiles = newFiles.filter(file => file.size <= 100 * 1024 * 1024) // 100MB limit
    setFiles(prevFiles => [...prevFiles, ...validFiles])
  }

  const handleInputChange = (event) => {
    handleFileUpload(event.target.files)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFileUpload(event.dataTransfer.files)
  }

  const handleDragEnter = () => setIsDragging(true)
  const handleDragLeave = () => setIsDragging(false)

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const fileAnalysis = useMemo(() => {
    const totalSize = files.reduce((acc, file) => acc + file.size, 0)
    const averageSize = files.length > 0 ? totalSize / files.length : 0
    const largestFile = files.reduce((largest, file) => file.size > largest.size ? file : largest, { size: 0 })
    const smallestFile = files.reduce((smallest, file) => file.size < smallest.size ? file : smallest, { size: Infinity })

    return {
      totalSize: (totalSize / (1024 * 1024)).toFixed(2),
      averageSize: (averageSize / (1024 * 1024)).toFixed(2),
      largestFile: largestFile.name ? `${largestFile.name} (${(largestFile.size / (1024 * 1024)).toFixed(2)} MB)` : 'N/A',
      smallestFile: smallestFile.name ? `${smallestFile.name} (${(smallestFile.size / (1024 * 1024)).toFixed(2)} MB)` : 'N/A',
    }
  }, [files])

  const handleFileClick = (file) => {
    setSelectedFile(file)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="sticky top-0 z-10 mx-auto max-w-3xl mt-4">
        <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-full px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center justify-between w-full">
              <Link href="/" className="flex-shrink-0">
                <span className="text-lg font-bold">FileUploader</span>
              </Link>
              <div className="flex items-baseline space-x-4">
                <Link href="/" className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                <Link href="/about" className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">About</Link>
                <Link href="/contact" className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-8">
        <h1 className="text-3xl font-bold mb-6 text-center">File Upload Dashboard</h1>
        
        <div className="mb-6">
          <Label htmlFor="search" className="sr-only">Search files</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search files..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div 
          className={`mb-6 ${isDragging ? 'border-4 border-dashed border-blue-500' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-lg font-semibold">Upload Files</span>
                  <span className="text-sm text-muted-foreground">Drag & drop or click to select</span>
                </div>
              </Label>
              <Input
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
                  <p className="text-lg truncate">{fileAnalysis.smallestFile}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Uploaded Files</h2>
          <span className="text-sm text-muted-foreground">{files.length} file(s)</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow duration-200" 
              onClick={() => handleFileClick(file)}
            >
              <CardContent className="p-4 flex items-start space-x-3">
                <File className="h-8 w-8 text-muted-foreground flex-shrink-0 mt-1" />
                <div className="flex-grow min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
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
                <div className="flex-grow min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Last Modified:</span>
                </div>
                <div className="text-sm">
                  {selectedFile.lastModifiedDate.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">File Type:</span>
                </div>
                <div className="text-sm">
                  {selectedFile.type || "Unknown"}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}