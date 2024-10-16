import React, { useState, useEffect,useRef  } from 'react';
import { useParams } from 'react-router-dom';
import './FamilyPage.css';
import searchIcon from './assets/search.png';

function Familys() {
    const { family_query } = useParams();
    const [samples, setSamples] = useState([]);
    const [changeAnimation,setAnimation] = useState('none')
    const inputRef = useRef(null);
    
    useEffect(() => {
        const getSamples = async (url) => {
            try {
              const response = await fetch(url);
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              const data = await response.json();
              setSamples(data.samples);
            } catch (error) {
              console.log(error)
            }
          };
      if (family_query) {
        getSamples(`/api/familys/${family_query}`);
      }
      else{
        getSamples(`/api/latest_samples`);
      }
    }, [family_query]);
    const searchItem = async (item) => {
      try {
        const response = await fetch(`/api/search/${encodeURIComponent(item)}`);
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
    <div className="Family">
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
      <div id="samples">
            <div id="legend" className="grid-container2">
                <label className="grid-item" id="s">SHA-256</label>
                <label className="grid-item" id="f">FAMILY</label>
                <label className="grid-item"id="c">ANALYZED AT</label>
            </div>
            <hr/>
            <div>
          {samples.length > 0 ? (
            samples.map((sample, index) => (
              <div key={index}>
                <div id="sample" className="grid-container">
                  <a className="grid-item" id="SHA" href={`../samples/${sample.sha256}`}>
                    {sample.sha256}
                  </a>
                  <label className="grid-item" id="FAM">{sample.family}</label>
                  <label id="ANAT">{sample.date}</label>
                </div>
                <hr />
              </div>
            ))
          ) : (
            <p>No samples available</p>
          )}
        </div>
      </div>
    </div>
    );
  }
  
  export default Familys;