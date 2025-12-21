
import React, { useState } from 'react';
import Button from './src/shared/components/shared/feedback/Button';
import './src/styles/index.css';

export default function ButtonTest() {
    return (
        <div className="p-10 space-y-4 bg-gray-200">
            <h1>Button Loading State Test</h1>
            <div className="flex flex-col gap-4">
                <Button color="darkBlue" loading={true}>Dark Blue Loading</Button>
                <Button color="gold" loading={true}>Gold Loading</Button>
                <Button color="whiteBlue" loading={true}>White Blue Loading</Button>
                <Button color="white" loading={true}>White Loading</Button>
            </div>
        </div>
    );
}
