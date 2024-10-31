import React, { useState, useEffect } from 'react'
import { Container, Row, Button } from 'react-bootstrap'
import Header from '../components/Header/Header'
import { BRCButton } from '../components/Dashboard/BRCButton'
import { CollectionButton } from '../components/Dashboard/CollectionButton'
import { StakeButton } from '../components/Dashboard/StakeButton'
import frogImage1 from "../assets/img/collection/frog-image1.svg"
import linkIcon from "../assets/img/collection/link-icon.svg"
import openIcon from "../assets/img/collection/open-icon.svg"
import { useLocation } from "react-router-dom";
import { backendAxios, uniSatAxios } from "../utils/axiosInstances";

const Nftdetail = () => {

    const location = useLocation();
    const collectionName = location.state.id;
    const collectionDesc = location.state.desc;

    console.log(collectionDesc);

    const [collectionData, setCollectionData] = useState(null);

    useEffect(() => {
        const fetchCollectionInfo = async () => {
            try {
                const response = await uniSatAxios.post('/v3/market/collection/auction/inscription_info', {
                    inscriptionId: collectionName
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

    const renderDashboard = () => {
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
                <Row >
                    <div className='header-nftdetail'>
                        {collectionData && (
                            <>
                                <div className='nft-card'>
                                    <div className='nft-card-image' style={{ position: 'relative' }}>
                                        <img
                                            src={collectionData.inscriptionId.startsWith('https://') ?
                                                collectionData.inscriptionId : `https://static.unisat.io/content/${collectionData.inscriptionId}`}
                                            alt="Collection Icon"
                                            style={{ width: "100%", height: "100%" }}
                                        />
                                        <div style={{ position: 'absolute', top: 1, left: 3 }}>
                                            <Button className='extra-btn'>
                                                <a href={`https://ordinalscan.net/inscription/${collectionName}`}>
                                                    <img src={openIcon} style={{ height: "1.35rem", width: "1.5rem", marginTop: "-5px" }} />
                                                </a>
                                            </Button>
                                        </div>
                                        <div style={{ position: 'absolute', top: 1, left: 55 }}>
                                            <Button className='extra-btn'>
                                                <a href={`https://static.unisat.io/inscription/content/${collectionName}`}>
                                                    <img src={linkIcon} style={{ height: "1.35rem", width: "1.5rem", marginTop: "-5px" }} />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className='buy-now-btn'> Buy Now &nbsp; &gt; </div>
                                </div>
                                <div className='nft-information'>
                                    <div className='nft-info-heading'>
                                        {collectionData.collectionItemName}
                                    </div>
                                    <div className='nft-info-detail'>
                                        {collectionDesc}
                                    </div>
                                    <div className='nft-info-collection-info'>
                                        <div className='slot-1'>
                                            <span style={{ color: "#FE7024" }}>{collectionData.collectionName}</span>  &nbsp; Collection
                                        </div>
                                        <div className='slot-2'>
                                            <span style={{ color: "#FE7024" }}>
                                                {collectionData.address.substring(0, 10)}.....{collectionData.address.substring(collectionData.address.length - 10)}
                                            </span> &nbsp; Owner
                                        </div>
                                    </div>
                                    <div className='nft-detail-heading' style={{ marginTop: "3rem" }}>
                                        Details
                                    </div>
                                    <div className='nft-detail-table'>
                                        <table>
                                            <tr class='table-row'>
                                                <td>Inscription Number</td>
                                                <td><span style={{ color: "rgba(254, 112, 36, 1)" }}>#{collectionData.inscriptionNumber}</span></td>
                                            </tr>
                                            <tr class='table-row'>
                                                <td>Inscription Id</td>
                                                <td><span style={{ color: "rgba(254, 112, 36, 1)" }}>{collectionData.inscriptionId}</span></td>
                                            </tr>
                                            <tr class='table-row'>
                                                <td>Address</td>
                                                <td><span style={{ color: "rgba(254, 112, 36, 1)" }}>{collectionData.address}</span></td>
                                            </tr>
                                            <tr class='table-row'>
                                                <td>Output Value</td>
                                                <td><span style={{ color: "rgba(254, 112, 36, 1)" }}>{collectionData.utxo.satoshi}</span></td>
                                            </tr>
                                            <tr class='table-row'>
                                                <td>Content length</td>
                                                <td><span style={{ color: "rgba(254, 112, 36, 1)" }}>3316</span></td>
                                            </tr>
                                            <tr class='table-row'>
                                                <td>Content type</td>
                                                <td><span style={{ color: "rgba(254, 112, 36, 1)" }}>{collectionData.contentType}</span></td>
                                            </tr>
                                            <tr class='table-row'>
                                                <td>Timestamp</td>
                                                <td><span style={{ color: "rgba(254, 112, 36, 1)" }}>11/3/2023</span></td>
                                            </tr>
                                            <tr class='table-row'>
                                                <td>Genesis height</td>
                                                <td><span style={{ color: "rgba(254, 112, 36, 1)" }}>780225</span></td>
                                            </tr>
                                            <tr class='table-row'>
                                                <td>Genesis transaction</td>
                                                <td><span style={{ color: "rgba(254, 112, 36, 1)" }}>681633dd79dcd90230012d085175064bdc94a06a90011ead2d296d9d29997c1f</span></td>
                                            </tr>
                                        </table>

                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Row>
            </Container >
        )
    }

    return (
        <>
            <Header />
            <div className='nftdetail'>{renderDashboard()} </div>
        </>
    )
}

export default Nftdetail