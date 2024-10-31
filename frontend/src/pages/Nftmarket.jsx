import React, { useState, useEffect } from 'react'
import Header from '../components/Header/Header'
import { Container, Row, Button } from 'react-bootstrap'
import { BRCButton } from '../components/Dashboard/BRCButton';
import { CollectionButton } from '../components/Dashboard/CollectionButton';
import { StakeButton } from '../components/Dashboard/StakeButton';
import unisatLogo from "../assets/img/unisat-logo.svg";
import { backendAxios, uniSatAxios } from "../utils/axiosInstances";
import { useNavigate } from "react-router-dom";
import searchIcon from "../assets/img/collection/search-icon.svg"
import { RecentTransactions } from '../components/Dashboard/RecentTransactions/RecentTransactions';

const Nftmarket = () => {

    const [collectionList, setCollectionList] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [buttonValue, setButtonValue] = useState('');
    const [dateButton, setDateButton] = useState('all');
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        fetchCollectionList();
    }, [page, searchValue, dateButton]);

    const navigate = useNavigate();

    const handleClick = (data) => {
        navigate("/detail", { state: data });
    };

    const handleButtonClick = (value) => {
        setButtonValue(value);
    };

    const handleDateButtonClick = (value) => {
        setDateButton(value);
    };

    const handleSearchChange = (event) => {
        setSearchValue(event.target.value);
    };

    const handleSearch = () => { };

    const fetchCollectionList = async () => {
        try {
            let filter = {
                timeType: dateButton,
            };

            // Conditionally include the name field based on searchValue
            if (searchValue.trim() !== '') {
                filter.name = searchValue;
            }

            const response = await uniSatAxios.post('/v3/market/collection/auction/collection_statistic_list', {
                filter: filter,
                start: (page - 1) * 20,
                limit: 20,
            });
            if (response.data.code === 0) {
                setCollectionList(response.data.data.list);
                const totalCount = response.data.data.total;
                setTotalPages(Math.ceil(totalCount / 20));
            } else {
                console.error('Failed to fetch collection list:', response.data.msg);
            }
        } catch (error) {
            console.error('Error fetching collection list:', error);
        }
    };

    const handlePreviousPage = () => {
        setPage(page - 1);
    };

    const handleNextPage = () => {
        setPage(page + 1);
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxPageDisplay = 2; // Number of pages to display on each side

        if (totalPages <= maxPageDisplay * 2 + 1) {
            // If totalPages is less than or equal to twice the maxPageDisplay plus 1,
            // display all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <Button key={i} onClick={() => setPage(i)} disabled={page === i} className='page-btn'>
                        {i}
                    </Button>
                );
            }
        } else {
            // Otherwise, display first five and last five pages with ellipsis in between
            for (let i = 1; i <= maxPageDisplay; i++) {
                pages.push(
                    <Button key={i} onClick={() => setPage(i)} disabled={page === i} className='page-btn'>
                        {i}
                    </Button>
                );
            }
            pages.push(<span key="ellipsis1">...</span>);
            for (let i = totalPages - maxPageDisplay + 1; i <= totalPages; i++) {
                pages.push(
                    <Button key={i} onClick={() => setPage(i)} disabled={page === i} className='page-btn'>
                        {i}
                    </Button>
                );
            }
        }

        return pages;
    };



    const renderDashboard = () => {

        const [inputPage, setInputPage] = useState(""); // State to store the input page number

        const handleInputChange = (e) => {
            setInputPage(e.target.value);
        };

        const handleGoToPage = () => {
            const pageNumber = parseInt(inputPage);
            if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
                setPage(pageNumber);
                setInputPage(""); // Clear input field after navigating
            }
        };


        return (
            <Container >
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
                    <div className='header-buttons'>
                        <Button className='head-btn-1' onClick={() => handleButtonClick('All')}>
                            All
                        </Button>
                        <Button className='head-btn-4' onClick={() => handleButtonClick('Trending')}>
                            Trending
                        </Button>
                    </div>
                </Row>
                <Row>
                    <div className='search-main-container'>
                        <div className='header-labels'>
                            Trending Collections
                        </div>
                        <div className='right-filter'>
                            <div className='search-container' style={{ marginTop: "1rem" }}>
                                <div className='search-field' >
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
                            </div>
                            <div className='header-buttons'>
                                <Button className='head-btn-1' onClick={() => handleDateButtonClick('1h')}>
                                    1h
                                </Button>
                                <Button className='head-btn-2' onClick={() => handleDateButtonClick('6h')}>
                                    6h
                                </Button>
                                <Button className='head-btn-2' onClick={() => handleDateButtonClick('24d')}>
                                    24d
                                </Button>
                                <Button className='head-btn-2' onClick={() => handleDateButtonClick('30d')}>
                                    30d
                                </Button>
                                <Button className='head-btn-3' onClick={() => handleDateButtonClick('All')}>
                                    All
                                </Button>
                            </div>
                        </div>
                    </div>
                </Row>
                <Row>
                    <div className='nft-detail-table'>
                        <table>
                            <thead>
                                <tr className='table-header'>
                                    <th>Rank</th>
                                    <th colSpan={3}>Collection</th>
                                    <th>Floor Price</th>
                                    <th>Volume</th>
                                    <th>Listed</th>
                                    <th>Items</th>
                                </tr>
                            </thead>
                            <tbody>
                                {collectionList.map((collection, index) => (
                                    <tr key={collection.collectionId} className='table-row' onClick={() => handleClick(collection.collectionId)}>
                                        <td>{(page - 1) * 20 + index + 1}</td>
                                        <td colSpan={3}>
                                            <div className='collection-container'>
                                                <div className="iconContainer">
                                                    <div className="icon">
                                                        {collection.iconContentType === "image/svg+xml" && !collection.icon.startsWith('https://') ? (
                                                            <iframe
                                                                src={collection.icon.startsWith('https://') ? collection.icon : `https://static.unisat.io/content/${collection.icon}`}
                                                                style={{ marginTop: "-0.75rem", height: "3rem", width: "3rem" }}
                                                                alt="Collection Icon"
                                                            />
                                                        ) : collection.iconContentType === "text/plain;charset=utf-8" ? (
                                                            <div
                                                                style={{ marginTop: "-0.75rem", height: "3rem", width: "100%" }} // Adjusted width to 100%
                                                            // alt="Collection Icon"
                                                            >10</div>
                                                        ) : (
                                                            <img
                                                                src={collection.icon.startsWith('https://') ? collection.icon : `https://static.unisat.io/content/${collection.icon}`}
                                                                style={{ marginTop: "-0.75rem", height: "3rem", width: "8rem" }}
                                                                alt="Collection Icon"
                                                            />
                                                        )}

                                                    </div>
                                                </div>
                                                <div className="textContainer" style={{ justifyContent: "left" }}>
                                                    {collection.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{collection.floorPrice} ETH</td>
                                        <td>{collection.total} ETH</td>
                                        <td>{collection.listed}</td>
                                        <td>{collection.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Row>
                <Row>
                    <div className='pagination' style={{ overflowX: "auto" }}>
                        {/* Previous button */}
                        <Button disabled={page === 1} onClick={handlePreviousPage} className='prev-btn'>
                            &#60;
                        </Button>
                        {/* Page numbers */}
                        {renderPageNumbers()}
                        {/* Next button */}
                        <Button disabled={page === totalPages} onClick={handleNextPage} className='next-btn'>
                            &#62;
                        </Button>
                        <Button onClick={handleGoToPage} className='go-btn'> Go to page </Button>
                        <input
                            type="text"
                            value={inputPage}
                            onChange={handleInputChange}
                            placeholder=""
                            className='page-txt-field'
                        />
                    </div>
                </Row>
                <Row>
                    <RecentTransactions />
                </Row>

            </Container>
        )
    }


    return (
        <>
            <Header />
            <div className='nftmarket'>{renderDashboard()} </div>
        </>
    )
}

export default Nftmarket