import React, { useState, useEffect } from 'react'
import Header from '../components/Header/Header'
import { Button, Container, Row } from 'react-bootstrap'
import frogImage1 from "../assets/img/collection/frog-image1.svg";
import { BRCButton } from '../components/Dashboard/BRCButton';
import { CollectionButton } from '../components/Dashboard/CollectionButton';
import { StakeButton } from '../components/Dashboard/StakeButton';
import searchIcon from "../assets/img/collection/search-icon.svg";
import sortIcon from "../assets/img/collection/sort-icon.svg"
import { useLocation } from "react-router-dom";
import { backendAxios, uniSatAxios } from "../utils/axiosInstances";
import { useNavigate } from "react-router-dom";
import webIcon from "../assets/img/collection/web-icon.svg";
import twitterIcon from "../assets/img/collection/twitter-icon.svg";
import discordIcon from "../assets/img/collection/discord-icon.svg";
import priceIcon from "../assets/img/collection/price-icon.svg";
import Buybutton from '../components/Nftmarket/Buybutton';
import ConnectWallet from '../components/Nftmarket/ConnectWallet';

const Collectiondetail = () => {

    const location = useLocation();
    const collectionName = location.state.replace(/\s+/g, '-').toLowerCase();

    console.log(collectionName);

    const [checkboxes, setCheckboxes] = useState([
        { id: 1, label: 'Price: From Low to High', checked: false },
        { id: 2, label: 'Price: From High to Low', checked: false },
        { id: 3, label: 'Time: From Latest to Earliest', checked: false },
        { id: 4, label: 'Time: From Earliest to Latest', checked: false },
        { id: 5, label: 'Inscription Number High', checked: false },
        { id: 6, label: 'Inscription Number Low', checked: false },
    ]);

    const handleCheckboxChange = (id) => {
        const updatedCheckboxes = checkboxes.map((checkbox) =>
            checkbox.id === id ? { ...checkbox, checked: !checkbox.checked } : checkbox
        );
        setCheckboxes(updatedCheckboxes);
        console.log("Selected checkboxes:");
        updatedCheckboxes.filter(checkbox => checkbox.checked).forEach(checkbox => console.log(checkbox.label));
    };

    const [searchValue, setSearchValue] = useState('');
    const [buttonValue, setButtonValue] = useState('');
    const [dropdownValue, setDropdownValue] = useState('usd');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const handleSearchChange = (event) => {
        setSearchValue(event.target.value);
    };

    const handleSearch = () => { };

    const handleDropdownChange = (event) => {
        setDropdownValue(event.target.value);
    };

    const handleMinPriceChange = (event) => {
        setMinPrice(event.target.value);
    };

    const handleMaxPriceChange = (event) => {
        setMaxPrice(event.target.value);
    };

    const handleButtonClick = (value) => {
        setButtonValue(value);
    };

    const fetchAuctionList = async () => {
        try {
            let minPriceValue = minPrice;
            let maxPriceValue = maxPrice;
            let sortCriteria = {};

            if (dropdownValue === 'usd') {
                if (minPrice && parseFloat(minPrice) > 0) {
                    minPriceValue = parseFloat(minPrice) * 1532;
                }
                if (maxPrice && parseFloat(maxPrice) > 0) {
                    maxPriceValue = parseFloat(maxPrice) * 1532;
                }
            } else if (dropdownValue === 'btc') {
                if (minPrice && parseFloat(minPrice) > 0) {
                    minPriceValue = parseFloat(minPrice) * 100000000;
                }
                if (maxPrice && parseFloat(maxPrice) > 0) {
                    maxPriceValue = parseFloat(maxPrice) * 100000000;
                }
            } else if (dropdownValue === 'sats') {
                if (minPrice && parseFloat(minPrice) > 0) {
                    minPriceValue = 50000;
                }
            }

            if (checkboxes.some(checkbox => checkbox.label === 'Price: From Low to High' && checkbox.checked)) {
                sortCriteria.initPrice = 1;
            } else if (checkboxes.some(checkbox => checkbox.label === 'Price: From High to Low' && checkbox.checked)) {
                sortCriteria.initPrice = -1;
            }

            if (checkboxes.some(checkbox => checkbox.label === 'Time: From Latest to Earliest' && checkbox.checked)) {
                sortCriteria.onSaleTime = 1;
            } else if (checkboxes.some(checkbox => checkbox.label === 'Time: From Earliest to Latest' && checkbox.checked)) {
                sortCriteria.onSaleTime = -1;
            }

            if (checkboxes.some(checkbox => checkbox.label === 'Inscription Number High' && checkbox.checked)) {
                sortCriteria.inscriptionNumber = 1;
            } else if (checkboxes.some(checkbox => checkbox.label === 'Inscription Number Low' && checkbox.checked)) {
                sortCriteria.inscriptionNumber = -1;
            }

            const filter = {
                nftType: "collection",
                collectionId: collectionName,
                nftConfirm: true,
                isEnd: false
            };

            if (buttonValue === 'All') {
                filter.all = true;
            }

            if (minPriceValue) {
                filter.minValue = minPriceValue;
            }

            if (maxPriceValue) {
                filter.maxValue = maxPriceValue;
            }

            if (searchValue.trim() !== '') {
                filter.collectionFuzzy = searchValue;
            }

            const response = await uniSatAxios.post('/v3/market/collection/auction/list', {
                filter: filter,
                sort: sortCriteria,
                start: 0,
                limit: 99,
                flash: false
            });

            if (response.status === 200) {
                console.log(response.data.data.total);
                setAuctionList(response.data.data.list);
            } else {
                console.error('Failed to fetch auction list');
            }
        } catch (error) {
            console.error('Error fetching auction list:', error);
        }
    };


    const [collectionData, setCollectionData] = useState(null);

    useEffect(() => {
        const fetchCollectionInfo = async () => {
            try {
                const response = await uniSatAxios.post('/v3/market/collection/auction/collection_statistic', {
                    collectionId: collectionName,
                });
                if (response.status === 200) {
                    console.log(response.data);
                    setCollectionData(response.data.data);
                } else {
                    console.error('Failed to fetch collection data');
                }
            } catch (error) {
                console.error('Error fetching collection data:', error);
            }
        };

        if (collectionName) {
            fetchCollectionInfo();
        }
    }, [collectionName]);

    const [auctionList, setAuctionList] = useState([]);

    useEffect(() => {
        if (collectionName) {
            fetchAuctionList();
        }
    }, [collectionName, buttonValue, dropdownValue, minPrice, maxPrice, checkboxes, searchValue]);

    const navigate = useNavigate();

    const handleClick = (id, desc) => {
        const data = { id: id, desc: desc };
        navigate("/nftdetail", { state: data });
    }

    const renderDashboard = () => {
        return (
            <Container>
                <Row>
                    <div className="buttoncontainer">
                        <div className='left-btn'>
                            <BRCButton />
                            <CollectionButton />
                        </div>
                        <div className='right-btn'>
                            <StakeButton />
                        </div>
                    </div>
                </Row>
                <Row>
                    <div className='header-detail'>
                        <div className='collection-image'>
                            {collectionData && (
                                <img
                                    src={collectionData.icon.startsWith('https://') ?
                                        collectionData.icon : `https://static.unisat.io/content/${collectionData.icon}`}
                                    alt="Collection Icon"
                                    style={{ width: "100%", height: "100%" }}
                                />
                            )}
                        </div>
                        <div className='collection-info'>
                            {collectionData && (
                                <>
                                    <div>
                                        <span style={{ fontSize: "2rem" }}>{collectionData.name}</span>
                                        &nbsp; <span style={{ color: '#FE7024' }}> | </span> &nbsp;
                                        <span>
                                            <a href={collectionData.website}><img src={webIcon} style={{ marginRight: "6px" }} /></a>
                                            <a href={collectionData.twitter}><img src={twitterIcon} style={{ marginRight: "5px" }} /></a>
                                            <a href={collectionData.discord}><img src={discordIcon} style={{ marginRight: "2px" }} /></a>
                                        </span>
                                        &nbsp; <span style={{ color: '#FE7024' }}> |  <Buybutton /> </span>
                                    </div>
                                    <div>
                                        {collectionData.desc}
                                    </div>
                                    <div className='info-start'>
                                        <div>
                                            <span style={{ color: "#FE7024" }}>{collectionData.btcValue} BTC &nbsp;</span> Volume
                                        </div>
                                        <div>
                                            <span style={{ color: "#FE7024" }}>{collectionData.floorPrice} BTC &nbsp;</span> Floor Price
                                        </div>
                                        <div>
                                            <span style={{ color: "#FE7024" }}>{collectionData.listed} &nbsp;</span> Listed
                                        </div>
                                        <div>
                                            <span style={{ color: "#FE7024" }}>{collectionData.total} &nbsp;</span> Items
                                        </div>
                                        <div>
                                            <span style={{ color: "#FE7024" }}>{collectionData.supply} &nbsp;</span> Supply
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Row>
                <Row>
                    <div className='collection-cards'>
                        <div className='filter'>
                            <div style={{ fontSize: "larger", paddingBottom: "1.25rem" }}>Filters</div>
                            <div className='header-buttons'>
                                <Button className='head-btn-1' onClick={() => handleButtonClick('All')}>
                                    All
                                </Button>
                                <Button className='head-btn-2' onClick={() => handleButtonClick('Listed')}>
                                    Listed
                                </Button>
                                <Button className='head-btn-3' onClick={() => handleButtonClick('Orders')}>
                                    Orders
                                </Button>
                            </div>
                            <div className='search-field'>
                                <div className='search-btn' onClick={handleSearch}>
                                    <img src={searchIcon} />
                                </div>
                                <div className='search-text'>
                                    <input
                                        type="text"
                                        placeholder="Search.."
                                        value={searchValue}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                            <div className='sort-heading' style={{ paddingTop: "15px", fontSize: "medium", paddingBottom: "15px" }}>
                                <img src={sortIcon} /> &nbsp; Sort
                            </div>
                            <div className='checkbox-style'>
                                {checkboxes.map((checkbox) => (
                                    <div key={checkbox.id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={checkbox.checked}
                                                onChange={() => handleCheckboxChange(checkbox.id)}
                                            /> &nbsp;
                                            {checkbox.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className='sort-heading' style={{ paddingTop: "15px", fontSize: "medium", paddingBottom: "15px" }}>
                                <img src={priceIcon} /> &nbsp; Price
                            </div>
                            <div className='price-dropdwon'>
                                <select id="price-dropdown" style={{ width: "100%" }} onChange={handleDropdownChange}>
                                    <option value="usd">USD</option>
                                    <option value="btc">BTC</option>
                                    <option value="sats">Sats</option>
                                </select>
                            </div>
                            <div className="text-fields">
                                <input type="text" id="min-price" placeholder="Min" className='min-field' onChange={handleMinPriceChange} />
                                <span style={{ width: "16%", textAlign: "center", marginLeft: "5px", marginRight: "5px" }}>to</span>
                                <input type="text" id="max-price" placeholder="Max" className='max-field' onChange={handleMaxPriceChange} />
                            </div>
                        </div>
                        <div className='card-grid'>
                            <div className='grid'>
                                {auctionList.map((item, index) => (
                                    <>
                                        <div key={index} className='grid-item'>
                                            <div className='grid-image' onClick={() => handleClick(item.inscriptionId, collectionData.desc)}>
                                                {item.contentType === "image/svg+xml" ? (
                                                    <iframe
                                                        src={item.inscriptionId.startsWith('https://') ? item.inscriptionId : `https://static.unisat.io/content/${item.inscriptionId}`}
                                                        alt="Collection Icon"
                                                        style={{ width: "100%", height: "100%" }}
                                                    />) : (<img
                                                        src={item.inscriptionId.startsWith('https://') ? item.inscriptionId : `https://static.unisat.io/content/${item.inscriptionId}`}
                                                        alt="Collection Icon"
                                                        style={{ width: "100%", height: "100%" }}
                                                    />)}
                                            </div>
                                            <div className='grid-info' onClick={() => handleClick(item.inscriptionId, collectionData.desc)}>
                                                <div className='left-grid-info'>
                                                    <div style={{ fontWeight: "600" }}>{item.collectionItemName}</div>
                                                    <div>
                                                        <span style={{ color: "#FE7024AD" }}>#{item.inscriptionNumber}</span>
                                                    </div>
                                                </div>
                                                <div className='right-grid-info'>
                                                    <div> Price </div>
                                                    <div>
                                                        <span style={{ color: "#FE7024AD" }}>$ {item.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <div className='buy-now-btn'> Buy Now &nbsp; &gt; </div> */}
                                            <ConnectWallet
                                                // selectedToken={selectedToken}
                                                // onSelectToken={setSelectedToken}
                                                // amount={amountToShowOnUI}
                                                // onChangeAmount={(_amount) => {
                                                //     setAmount(_amount);
                                                //     setAmountToShowOnUI(_amount);
                                                //     setMinP(0.8);
                                                //     setMaxP(1.2);
                                                // }}
                                                selectedListItem={item}
                                            // onSelectListItem={setSelectedListItem}
                                            // isLoadingList={isLoading}
                                            />
                                        </div>
                                    </>
                                ))}
                            </div>
                        </div>
                    </div>
                </Row>
            </Container>
        )
    }

    return (
        <>
            <Header />
            <div className='collectionDetails'>{renderDashboard()} </div>
        </>
    )
}

export default Collectiondetail