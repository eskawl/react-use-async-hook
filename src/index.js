import { useState, useEffect } from 'react';


const useAsync = ({ task, dataLoader, initialData }) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [taskResult, setTaskResult] = useState(null);
    const [runOnDemand, setRunOnDemand] = useState(() => {
        
    });

    useEffect(() => {
        let unhooked = false;
        
        setRunOnDemand(() => {
            async function fetchData() {
                try {
                    setLoading(true);
                    const res = await task();
                    setTaskResult(res);
                    const retrievedData = await dataLoader(res);
    
                    if (!unhooked) {
                        setData(retrievedData);
                    }
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(e);
                    if (!unhooked) {
                        setError(e);
                    }
                } finally {
                    if (!unhooked) {
                        setLoading(false);
                    }
                }
            }

            fetchData();
        });

        runOnDemand();

        return () => {
            unhooked = true;
        };
    }, [task, dataLoader]);

    return {
        data,
        loading,
        error,
        taskResult,
        runOnDemand,
    };
};

export default useAsync;
