import React from 'react';
import { Link } from 'react-router-dom';
import pdficon from '../images/pdf icon.png';
import wordicon from '../images/word icon.png';
import imgicon from '../images/image icon.png';
import keyicon from '../images/key icon.png';
import './CreateTest.css';

function CreateTest() {
    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <p className="lead" style={{ marginTop: "50px", fontSize: "40px", fontFamily: "Jost, sans-serif", fontWeight: "600", textAlign: 'center' }}>
                    Create Tests Easily: Upload <span style={{ color: "#014495" }}>PDFs</span>, <span style={{ color: "#014495" }}>Word</span> Documents, <span style={{ color: "#014495" }}>Images</span>, or Enter <span style={{ color: "#014495" }}>Keywords</span>
                </p>
                <h2 style={{ textAlign: 'center', marginBottom: "50px" }}>Select any below option to create mock test instantly</h2>
                <div className='card-container'>
                    <Link to='/pdfreader'>
                        <div className="card2">
                            <img className='svg' src={pdficon} alt="PDF to Mock" />
                            <div className="card__content2">
                                <p className="card__title2">PDF to MOCK</p>
                                <p className="card__description2">Convert your PDF documents into mock tests effortlessly.</p>
                            </div>
                        </div>
                    </Link>
                    <Link to='/wordreader'>
                        <div className="card2">
                            <img className='svg' src={wordicon} alt="Word to Mock" />
                            <div className="card__content2">
                                <p className="card__title2">WORD to MOCK</p>
                                <p className="card__description2">Transform Word documents into comprehensive mock tests.</p>
                            </div>
                        </div>
                    </Link>
                    <Link to='/imagereader'>
                        <div className="card2">
                            <img className='svg' src={imgicon} alt="Visual upload to Mock" />
                            <div className="card__content2">
                                <p className="card__title2">IMAGE to MOCK</p>
                                <p className="card__description2">Generate mock tests from images with ease.</p>
                            </div>
                        </div>
                    </Link>
                    <Link to='/keyword'>
                        <div className="card2">
                            <img className='svg' src={keyicon} alt="Keyword to Mock" />
                            <div className="card__content2">
                                <p className="card__title2">KEYWORD to MOCK</p>
                                <p className="card__description2">Create mock tests based on entered keywords instantly.</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CreateTest;
