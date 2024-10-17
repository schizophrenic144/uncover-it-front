"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Upload, MoreVertical, File } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export default function FileUploadHomepage() {
  const [files, setFiles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('CHECKING HASH');
  const [loaderColor, setLoaderColor] = useState('#000');
  const [borderColor, setBorderColor] = useState('rgb(0, 0, 0)');
  const [uploadButtonDisplay, setUploadButtonDisplay] = useState('none');
  const [statusDisplay, setStatusDisplay] = useState('InlineBlock');
  const [linkCheckDisplay, setLinkCheckDisplay] = useState('inline-block');
  const [fileUploadDisplay, setfileUploadDisplay] = useState('inline-block');
  const [linkSubmitDisplay, setlinkSubmitDisplay] = useState('none');
  const [changeAnimation, setAnimation] = useState('none');
  const [changeAnimationForUpload, setAnimationUpload] = useState('none');
  const [changeRandomLabels, setRandomLabels] = useState('inline-block');
  const inputRef = useRef(null);
  const linkRef = useRef(null);
  const [orDisplay, setOrDisplay] = useState('inline-block');
  const [statusHeight, setStatusHeight] = useState('20px');
  const [statusWidth, setStatusWidth] = useState('300px');
  const [opacity, setOpacity] = useState("1");
  const [pointer, setPointer] = useState("auto");
  const [stats, setStats] = useState({
    total: "",
    size: ""
  });

  useEffect(() => {
    try {
      const fetchStats = async () => {
        try {
          const response = await fetch(`/api/stats`);
          if (!response.ok) {
            setStats({
              total: "0",
              size: "0 Mb"
            });
          };
          const data = await response.json();
          setStats({
            total: data.total,
            size: data.size + " Mb"
          });
        } catch (error) {
          console.log(error)
        }
      };
      fetchStats();
    } catch (error) {
      setStats({
        total: "0",
        size: "0 Mb"
      })
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const checkFileHeader = (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const arrayBuffer = event.target.result;
          const uint8Array = new Uint8Array(arrayBuffer);
          const magicNumber = uint8Array.slice(0, 2).reduce(
            (acc, byte) => acc + byte.toString(16).padStart(2, '0'),
            ''
          ).toUpperCase();
          console.log(magicNumber);
          resolve(magicNumber === "4D5A");
        };

        reader.onerror = () => {
          reject(new Error("Failed to read the file"));
        };
        reader.readAsArrayBuffer(file.slice(0, 2));
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const isTheThing = await checkFileHeader(selectedFile)
    if (!isTheThing) {
      setAnimationUpload("flash 0.5s linear")
      setTimeout(() => {
        setAnimationUpload("none")
      }, 500);
      return "";
    }
    setRandomLabels("none")
    setFile(selectedFile);
    setUploadButtonDisplay("inline-block")
    setLinkCheckDisplay("none")
    setOrDisplay("none")
    if (status !== 'CHECKING HASH') {
      setStatus('PROCESSING');
      setLoaderColor('#ffffff');
    }
  };

  const handleLinkChange = (event) => {
    setRandomLabels("none")
    setlinkSubmitDisplay("inline-block")
    setLinkCheckDisplay("none")
    setOrDisplay("none")
    setfileUploadDisplay("none")
  };

  const handleLinkSubmit = async (event) => {
    event.preventDefault();
    setOpacity("0.5")
    setPointer("none")
    setStatusDisplay("flex")
    setStatusHeight("200px")
    setStatusWidth("600px")
    setStatus('ANALYZING YOUR LINK');
    setLoaderColor('#ffffff');
    setBorderColor("rgb(255,255,255)")

    const linkresp = await fetch('/api/link', {
      method: 'POST',
      body: JSON.stringify({ 'link': linkRef.current.value }),
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(linkresp)
  };

  const searchItem = async (item) => {
    try {
      const response = await fetch(`/api/search/${encodeURIComponent(item)}`);
      if (response.status === 404) {
        setAnimation("flash 0.5s linear")
        setTimeout(() => {
          setAnimation("none")
        }, 500);
      }
      const searchData = await response.json();
      if (searchData.sha256) {
        window.location.href = `/samples/${encodeURIComponent(searchData.sha256)}`;
      }
      else if (searchData.family) {
        window.location.href = `/family/${encodeURIComponent(searchData.family)}`;
      }
      else if (!searchData.status) {
        console.log("setting animations")
        setAnimation("flash 0.5s linear ")
        setTimeout(() => {
          setAnimation("none")
        }, 500);
      }
    } catch (error) {
      console.error('Failed to load new page:', error);
    }
  };

  const handleSearch = async (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      searchItem(event.target.value);
    }
  };

  const handleSearchButton = async (event) => {
    searchItem(inputRef.current.value);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) return;
    setOpacity("0.5")
    setPointer("none")
    setStatusDisplay("flex")
    setStatusHeight("200px")
    setStatusWidth("600px")
    setStatus('CHECKING HASH');
    setLoaderColor('#ffffff');
    setBorderColor('rgb(255, 255, 255)')

    const sha256Hash = await calculateSha256(file);

    try {
      const sha256Response = await fetch('/api/hash', {
        method: 'POST',
        body: JSON.stringify({ '256': sha256Hash }),
        headers: { 'Content-Type': 'application/json' },
      });
      const sha256Data = await sha256Response.json();

      if (!sha256Data.exists) {
        setStatus('PROCESSING');
        await analyze(file, sha256Hash);
      } else if (sha256Data.exists) {
        window.location.href = `/samples/${encodeURIComponent(sha256Hash)}`;
      } else {
        setStatus('Error processing file');
      }
    } catch (error) {
      setStatus('Server or upload error!');
    }
  };

  const calculateSha256 = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const wordArray = WordArray.create(arrayBuffer);
      const hashedValue = SHA256(wordArray).toString();
      return hashedValue;
    }
    catch (error) {
      //shouldnt error :pray:
    }
  };

  const analyze = async (file, sha256Hash) => {
    const formData = new FormData();
    formData.append('file', file);
    //formData.append('task_id', generateRandomId(40));
    formData.append('256', sha256Hash);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.message === 'Done') {
        window.location.href = `/samples/${encodeURIComponent(sha256Hash)}`;
      } else {
        setStatus(data.message);
        setLoaderColor('#ff0000');
        setTimeout(() => {
          setUploadButtonDisplay('none')
          setStatusDisplay("none")
          setStatusHeight("20px")
          setBorderColor("rgb(0,0,0)")
          setStatusWidth("200px");
          setOpacity("1")
          setPointer("auto")
          setLinkCheckDisplay("inline-block")
          setOrDisplay("inline-block")
        }, 5000);
      }
    } catch (error) {
      setStatus('Upload error!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">File Upload Dashboard</h1>
        
        <div className="mb-6 flex items-center space-x-4">
          <div className="flex-grow">
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sort by name</DropdownMenuItem>
              <DropdownMenuItem>Sort by date</DropdownMenuItem>
              <DropdownMenuItem>Sort by size</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mb-6">
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
                onChange={handleFileChange}  // Corrected function name
                multiple
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Uploaded Files</h2>
          <span className="text-sm text-muted-foreground">{files.length} file(s)</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file, index) => (  // Corrected variable name
            <Card key={index}>
              <CardContent className="p-4 flex items-center space-x-3">
                <File className="h-8 w-8 text-muted-foreground" />
                <div>
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
    </div>
  )
}
