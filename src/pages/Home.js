import React, { useState, useEffect,useRef  } from 'react';
import SHA256 from 'crypto-js/sha256';
import WordArray from 'crypto-js/lib-typedarrays';
import searchIcon from './assets/search.png';
import './Home.css';



function Home() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('CHECKING HASH');
  const [loaderColor, setLoaderColor] = useState('#000');
  const [borderColor,setBorderColor] = useState('rgb(0, 0, 0)');
  const [uploadButtonDisplay,setUploadButtonDisplay] = useState('none');
  const [statusDisplay,setStatusDisplay] = useState('InlineBlock');
  const [linkCheckDisplay,setLinkCheckDisplay] = useState('inline-block');
  const [fileUploadDisplay,setfileUploadDisplay] = useState('inline-block');
  const [linkSubmitDisplay,setlinkSubmitDisplay] = useState('none');
  const [changeAnimation,setAnimation] = useState('none')
  const [changeAnimationForUpload,setAnimationUpload] = useState('none')
  const [changeRandomLabels,setRandomLabels] = useState('inline-block')
  const inputRef = useRef(null);
  const linkRef = useRef(null);

  const [orDisplay,setOrDisplay] = useState('inline-block');
  const [statusHeight,setStatusHeight] = useState('20px');
  const [statusWidth,setStatusWidth] = useState('300px');
  
  const [opacity,setOpacity] = useState("1");
  const [pointer,setPointer] = useState("auto")
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
              total:"0",
              size:"0 Mb"
            });
          };
          const data = await response.json();
          setStats({
            total:data.total,
            size:data.size +" Mb"
          });
        } catch (error) {
          console.log(error)
        }
      };
      fetchStats();
    } catch (error) {
      setStats({
        total:"0",
        size:"0 Mb"
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
    if(!isTheThing){
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
      body: JSON.stringify({'link': linkRef.current.value }),
      headers: { 'Content-Type': 'application/json'},
    });
    console.log(linkresp)

  };

  const searchItem = async (item) => {
    try {
      const response = await fetch(`/api/search/${encodeURIComponent(item)}`);
      if(response.status === 404){
        setAnimation("flash 0.5s linear")
        setTimeout(() => {
          setAnimation("none")
        }, 500);
      }
      const searchData = await response.json();
      if (searchData.sha256){
        window.location.href = `/samples/${encodeURIComponent(searchData.sha256)}`;
      }
      else if (searchData.family){
        window.location.href = `/family/${encodeURIComponent(searchData.family)}`;
      }
      else if (!searchData.status){
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
        headers: { 'Content-Type': 'application/json'},
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
    try{
      const arrayBuffer = await file.arrayBuffer();
      const wordArray = WordArray.create(arrayBuffer);
      const hashedValue = SHA256(wordArray).toString();
      return hashedValue;
    }
    catch (error){
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
  /*
  const generateRandomId = (length) => {
    const charset = 'АБВГДЕЖЗИИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯ0';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }
    return result;
  };
  */

  return (
    <div className="App">
        <div id="top">
          <div id="top-in">
            <h1><a href="/">Uncover It</a></h1>
            <input
              ref={inputRef}
              type="text"
              id="search"
              placeholder="Family, SHA-256 Hash"
              style={{animation:changeAnimation}}
              onKeyDown={handleSearch}
              
            />
            <button type="button" id="searchButton" onClick={handleSearchButton}><img src={searchIcon} alt="searchIcon"></img></button>

            <div className="dropdown">
              <button className="dropbtn">|||</button>
              <div className="dropdown-content">
                <a href="/latest">Latest Samples</a>
                <a href="/links">Supported Links</a>
                <a href="/malware">Supported Malware</a>
                <a href="https://discord.gg/r7vRB7TQuE" target="_blank" rel="noreferrer">Discord</a>
              </div>
            </div>
          </div>
          <hr />
        </div>
        <div id="status" style={{borderColor:borderColor,height:statusHeight,width:statusWidth}}>
          <div id="st" style={{display:statusDisplay,alignItems: 'center'}}>
            <span id="statusText">{status} </span>
            <div
              className="loader"
              style={{ borderTopColor: loaderColor }}
            ></div>
          </div>
        </div>
        <form id="uploadForm" onSubmit={handleUpload}>
          <label htmlFor="fileInput" className="file-upload" id="choose" style={{animation:changeAnimationForUpload,opacity:opacity,pointerEvents:pointer,display:fileUploadDisplay}}>
            Choose a file
          </label>
          <input type="file" id="fileInput" onChange={handleFileChange} />
          <button type="submit" id="upload" style={{display:uploadButtonDisplay,opacity:opacity,pointerEvents:pointer}}>Upload</button>
          <br/>
          <br/>
          <label id="f_size" style={{display:changeRandomLabels}}>100Mb Limit</label>
        </form>
        <p style={{display:orDisplay}}>or</p>
        <form id="linkForm" onSubmit={handleLinkSubmit}>
          <button type="button" id="linkCheck" onClick={handleLinkChange} className="file-upload" style={{display:linkCheckDisplay}}>Submit a link</button>
          <br />
          <input ref={linkRef} type="text" id="linkInput" name="userInput" style={{display:linkSubmitDisplay,opacity:opacity,pointerEvents:pointer}} placeholder="https://link-to.malware/malware"/>
          <br />
          <button type="submit" id="submitLink" className="file-upload" style={{display:linkSubmitDisplay,opacity:opacity,pointerEvents:pointer}}>Submit</button>
          <label id="f_size" style={{display:changeRandomLabels}}>NO SUPPORT AT THE MOMENT!</label>
        </form>
        <h2 id="stats">
          Global files analyzed: {stats.total} | {stats.size}
        </h2>
        <hr />
      </div>
  );
}

export default Home;
