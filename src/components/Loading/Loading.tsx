import React from 'react';
import stylesheet from './Loading.module.css';

const Loading: React.FC<{ loading: boolean }> = ({ loading }) => {
    if (!loading) return null;
    return (
        <span className={stylesheet.loader}></span>
    );
};

export default Loading;
