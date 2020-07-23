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

    const isUnhooked = useRef(false);
    const shouldExecute = useRef(autoExecute);

    const run = useCallback(async (...taskArgs) => {
        const unhooked = isUnhooked.current;

        if (!shouldExecute.current) {
            // Right now, once run is invoked,
            // execution flag is set to true.
            // This causes autoExecution behaviour
            // when task, or initial data changes.
            // TODO: Add a config, to enable strict
            // auto execution i.e., task, execution
            // will not invoke run. It can only be
            // invoked from outside.
            shouldExecute.current = true;
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
    }, [dataLoader, onError, task]);


    useEffect(() => {
        if (shouldExecute.current) {
            run();
        }

        return () => {
            isUnhooked.current = true;
        };
    }, [run]);

    return {
        data,
        loading,
        error,
        taskResult,
        execute: run,
    };
};

export default useAsync;
