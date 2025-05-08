import React from 'react';
import stylesheet from './SearchInputLoading.module.css';

const Loading: React.FC<{ loading: boolean }> = ({loading}) => {
    if (!loading) return null;
    return (
        <span className={stylesheet.loader}>
            <span className={stylesheet.dot}/>
            <span className={stylesheet.dot}/>
            <span className={stylesheet.dot}/>
        </span>
    );
};

export default Loading;
