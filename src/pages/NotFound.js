import React, { useState, useEffect,useRef  } from 'react';
import searchIcon from './assets/search.png';
import skullVideo from './assets/what_are_you_looking_for.gif'
import './SamplesPage.css';

function NotFound() {
    const [changeAnimation,setAnimation] = useState('none')
    const inputRef = useRef(null);
    
    useEffect(() => {
    });
    const searchItem = async (item) => {
      try {
        const response = await fetch(`/search/${encodeURIComponent(item)}`);
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
    <div className="NotFound">
      <script>
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function () {}
      </script>
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
                <a href="https://discord.gg/r7vRB7TQuE" target="_blank" rel="noreferrer">Discord</a>
              </div>
            </div>
          </div>
          <hr />
        </div>
        <div>
            <h2>Not found | 404</h2>
            <img src={skullVideo} alt="404" ></img>
        </div>
      </div>
    );
  }
  
  export default NotFound;