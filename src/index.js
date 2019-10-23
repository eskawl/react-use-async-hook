import { useState, useEffect, useRef } from 'react';


const useAsync = ({
    task, dataLoader, initialData, autoExecute,
}) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [taskResult, setTaskResult] = useState(null);

    const execute = useRef(() => {});

    useEffect(() => {
        let unhooked = false;

        const run = async () => {
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
        };

        execute.current = (run);

        if (autoExecute) {
            run();
        }

        return () => {
            unhooked = true;
        };
    }, [task, dataLoader, autoExecute]);

    return {
        data,
        loading,
        error,
        taskResult,
        execute: execute.current,
    };
};

export default useAsync;
