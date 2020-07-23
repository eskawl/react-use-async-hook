/* eslint import/no-unresolved: [2, { ignore: ['^react$'] }] */
import { useState, useEffect, useRef, useCallback } from 'react';

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

    const [loading, setLoading] = useState(!!autoExecute);
    const [shouldExecute, setShouldExecute] = useState(autoExecute);

    const getIsUnhooked = useRef(() => false);

    // eslint-disable-next-line no-shadow
    const run = useCallback(async (...taskArgs) => {
        const unhooked = getIsUnhooked.current();

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
                setError('');
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
    }, [dataLoader, onError, shouldExecute, task]);


    useEffect(() => {
        let unhooked = false;
        getIsUnhooked.current = () => unhooked;

        if (shouldExecute) {
            run();
        }

        return () => {
            unhooked = true;
        };
    }, [run, shouldExecute]);

    return {
        data,
        loading,
        error,
        taskResult,
        execute: run,
    };
};

export default useAsync;
