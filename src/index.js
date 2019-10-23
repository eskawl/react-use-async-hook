import { useState, useEffect, useRef } from 'react';


const useAsync = ({
    task, dataLoader, initialData, autoExecute,
}) => {
    const [data, setData] = useState(initialData);
    const [error, setError] = useState('');
    const [taskResult, setTaskResult] = useState(null);

    const execute = useRef(() => {});

    let shouldAutoExecute = autoExecute;


    if (shouldAutoExecute === undefined) {
        shouldAutoExecute = true;
    }

    const [loading, setLoading] = useState(!!shouldAutoExecute);


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

        if (shouldAutoExecute) {
            run();
        }

        return () => {
            unhooked = true;
        };
    }, [task, dataLoader, shouldAutoExecute]);

    return {
        data,
        loading,
        error,
        taskResult,
        execute: execute.current,
    };
};

export default useAsync;
