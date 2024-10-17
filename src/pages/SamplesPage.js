import React, { useState, useEffect,useRef  } from 'react';
import { useParams } from 'react-router-dom';
import searchIcon from './assets/search.png';
import './SamplesPage.css';

function Samples() {
    const [dataFontSize] = useState('15px');
    const { sampleId } = useParams();
    const inputRef = useRef(null);
    const [changeAnimation,setAnimation] = useState('none')
    const [sample, setStats] = useState({
      tag: "",
      family: "",
      sha256: "",
      file_name: "",
      file_size: "",
      config: "",
      date: "",
  });
    useEffect(() => {
        const getSample = async () => {
            try {
              const response = await fetch(`https://api.uncover.us.kg/sample/${sampleId}`);
              if (!response.ok) {
                window.location.href = "/404"
                return;
              }
              const data = await response.json();
              setStats({
                tag: data.tag,
                family: data.family,
                sha256: data.sha256,
                file_name: data.file_name,
                file_size: data.file_size + " Mb",
                config: data.config,
                date: data.date,
              });
            } catch (error) {
            }
          };
      if (sampleId) {
        getSample();
      }
    }, [sampleId]);
    const searchItem = async (item) => {
      try {
        const response = await fetch(`https://api.uncover.us.kg/search/${encodeURIComponent(item)}`);
        if(response.status === 404){
          setAnimation("flash 0.5s linear ")
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
  
    return (
    <div className="Samples">
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
            <button type="button" id="searchButton" onClick={handleSearchButton}><img src={searchIcon} alt="searchIcon" ></img></button>

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
      <div id="data">
        <div id="info">
          <p  style={{fontSize:dataFontSize}}>
            FAMILY: {sample.family}<br />
            TYPE: {sample.tag}<br />
            FILENAME: {sample.file_name}<br />
            DATE: {sample.date}<br />
            FILE SIZE: {sample.file_size}<br /><br />
            SHA256: {sample.sha256}
          </p>
        </div>
        <div id="type">
          {sample.family}<br />
        </div>
      </div>
      <h3>Config</h3>
      <div id="config">
      {sample.config.split(/<br\s*\/?>/).map((line, index) => (
                <div key={index}>{line}</div>
            ))}
      </div>
    </div>
    );
  }
  
  export default Samples;
