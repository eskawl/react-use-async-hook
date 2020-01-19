/* eslint import/no-unresolved: [2, { ignore: ['^react$'] }] */
import { useState, useEffect, useRef } from 'react';

const identity = (x) => x;

const defaultConfig = {
    dataLoader: identity,
    autoExecute: true,
    initialData: null,
    onError: (error) => {
        // eslint-disable-next-line no-console
        console.error(error);
    },
};

const mergeConfig = (config, defaults) => {
    const result = {
        ...config,
    };

    Object.entries(defaults).forEach(([key, value]) => {
        if (!(key in result)) {
            result[key] = value;
        }
    });

    return result;
};

const useAsync = (config) => {
    const {
        task, dataLoader, initialData, autoExecute, onError,
    } = mergeConfig(config, defaultConfig);

    const [data, setData] = useState(initialData);
    const [error, setError] = useState('');
    const [taskResult, setTaskResult] = useState(null);

    const execute = useRef(() => { });

    const [loading, setLoading] = useState(!!autoExecute);
    const [shouldExecute, setShouldExecute] = useState(autoExecute);

    useEffect(() => {
        let unhooked = false;

        const run = async (...taskArgs) => {
            if (!shouldExecute) {
                setShouldExecute(true);
            }

            try {
                setLoading(true);
                const res = await task(...taskArgs);
                setTaskResult(res);
                const retrievedData = await dataLoader(res);

                if (!unhooked) {
                    setData(retrievedData);
                }
            } catch (e) {
                onError(e);
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

        if (shouldExecute) {
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
        execute: (...args) => {
            execute.current(...args);
        },
    };
};

export default useAsync;
