import React, { useEffect, useState } from 'react'
import Header from '../components/Header/Header'
import { Container, Row, Col, Button, Table } from 'react-bootstrap'
import { BRCButton } from '../components/Dashboard/BRCButton'
import { StakeButton } from '../components/Dashboard/StakeButton'
import { CollectionButton } from '../components/Dashboard/CollectionButton'
import walletLogo from '../assets/img/wallet-logo.svg';
import coinLogo from "../assets/img/coin-logo.svg";
import ordigenLogo from "../assets/img/ordigen-logo.svg";
import totalLPLogo from "../assets/img/total-lp-logo.svg";

const Staking = () => {
    const renderStakdashboard = () => {
        return (
            <>
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
                    <Row className="balanceAmnt">
                        <Col xs={12} sm={6} md={3}>
                            <Button className='Amntcount'>
                                <div className="iconContainer">
                                    <div className="icon">
                                        <img src={walletLogo} style={{ marginTop: "-0.75rem" }} />
                                    </div>
                                </div>
                                <div className="textContainer" style={{ justifyContent: "left" }}>
                                    <span className="smallText">ODGN Balance</span>
                                    <span className="largeText">25.00</span>
                                </div>
                            </Button>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Button className='Amntcount'>
                                <div className="iconContainer">
                                    <div className="icon">
                                        <img src={coinLogo} style={{ marginTop: "-0.75rem" }} />
                                    </div>
                                </div>
                                <div className="textContainer" style={{ justifyContent: "left" }}>
                                    <span className="smallText">ODGN Staked</span>
                                    <span className="largeText">0.00</span>
                                </div>
                            </Button>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Button className='Amntcount'>
                                <div className="iconContainer">
                                    <div className="icon">
                                        <img src={ordigenLogo} style={{ marginTop: "-0.75rem" }} />
                                    </div>
                                </div>
                                <div className="textContainer" style={{ justifyContent: "left" }}>
                                    <span className="smallText">Total Token Rewards</span>
                                    <span className="largeText">0.00</span>
                                </div>
                            </Button>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Button className='Amntcount'>
                                <div className="iconContainer">
                                    <div className="icon">
                                        <img src={totalLPLogo} style={{ marginTop: "-0.75rem" }} />
                                    </div>
                                </div>
                                <div className="textContainer" style={{ justifyContent: "left" }}>
                                    <span className="smallText">Total LP Rewards</span>
                                    <span className="largeText">0.00</span>
                                </div>
                            </Button>
                        </Col>
                    </Row>
                    <Row className='header-labels'>
                        Token Staking
                    </Row>
                    <Row>
                        <table>
                            <thead>
                                <tr className='table-header'>
                                    <td>Pools</td>
                                    <td>APR</td>
                                    <td>Amount Staked</td>
                                    <td>% Staked</td>
                                    <td>Rewards Pending</td>
                                    <td colSpan={1}>Actions</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className='table-row'>
                                    <td>14 days</td>
                                    <td>12%</td>
                                    <td>40.0000</td>
                                    <td>10%</td>
                                    <td className="d-flex align-items-center mt-2">
                                        <div className="mx-auto">
                                            <span className='large'>0.00</span>
                                        </div>
                                        <div className="d-flex flex-column">
                                            <Button className="btn-reward mb-2">CLAIM</Button>
                                            <Button className="btn-reward mb-2">COMPOUND</Button>
                                        </div>
                                    </td>
                                    <td>
                                        <Button className="btn-actions-stake mr-2">Stake</Button>
                                        <Button className="btn-actions-unstake">Unstake</Button>
                                    </td>
                                </tr>
                                <tr className='table-row'>
                                    <td>30 days</td>
                                    <td>12%</td>
                                    <td>40.0000</td>
                                    <td>10%</td>
                                    <td className="d-flex align-items-center mt-2">
                                        <div className="mx-auto">
                                            <span className='large'>0.00</span>
                                        </div>
                                        <div className="d-flex flex-column">
                                            <Button className="btn-reward mb-2">CLAIM</Button>
                                            <Button className="btn-reward mb-2">COMPOUND</Button>
                                        </div>
                                    </td>
                                    <td>
                                        <Button className="btn-actions-stake mr-2">Stake</Button>
                                        <Button className="btn-actions-unstake">Unstake</Button>
                                    </td>
                                </tr>
                                <tr className='table-row'>
                                    <td>60 days</td>
                                    <td>12%</td>
                                    <td>40.0000</td>
                                    <td>10%</td>
                                    <td className="d-flex align-items-center mt-2">
                                        <div className="mx-auto">
                                            <span className='large'>0.00</span>
                                        </div>
                                        <div className="d-flex flex-column">
                                            <Button className="btn-reward mb-2">CLAIM</Button>
                                            <Button className="btn-reward mb-2">COMPOUND</Button>
                                        </div>
                                    </td>
                                    <td>
                                        <Button className="btn-actions-stake mr-2">Stake</Button>
                                        <Button className="btn-actions-unstake">Unstake</Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Row>
                    <Row className='header-labels' style={{ marginTop: "3rem" }}>
                        LP Staking
                    </Row>
                    <Row>
                        <table>
                            <thead>
                                <tr className='table-header'>
                                    <td>Pools</td>
                                    <td>APR</td>
                                    <td>Amount Staked</td>
                                    <td>% Staked</td>
                                    <td>Rewards Pending</td>
                                    <td colSpan={1}>Actions</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className='table-row'>
                                    <td>LP Staking</td>
                                    <td>12%</td>
                                    <td>40.0000</td>
                                    <td>10%</td>
                                    <td className="d-flex align-items-center mt-2">
                                        <div className="mx-auto">
                                            <span className='large'>0.00</span>
                                        </div>
                                        <div className="d-flex flex-column">
                                            <Button className="btn-reward mt-3 mb-3">CLAIM</Button>
                                        </div>
                                    </td>
                                    <td>
                                        <Button className="btn-actions-stake mr-2 mt-2 mb-2">Stake</Button>
                                        <Button className="btn-actions-unstake">Unstake</Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Row>
                </Container>
            </>
        )
    }


    return (
        <>
            <Header />
            <div className="stakedashboard">{renderStakdashboard()}</div>
        </>
    )
}

export default Staking