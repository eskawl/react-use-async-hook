/* eslint import/no-unresolved: [2, { ignore: ['^react$'] }] */
import {
    useState, useEffect, useRef, useCallback,
} from 'react';

const identity = (x) => x;

const defaultConfig = {
    dataLoader: identity,
    autoExecute: true,
    strictAutoExecute: false,
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
        task, dataLoader, initialData, autoExecute, onError, strictAutoExecute,
    } = mergeConfig(config, defaultConfig);

    const [data, setData] = useState(initialData);
    const [error, setError] = useState('');
    const [taskResult, setTaskResult] = useState(null);

    const [loading, setLoading] = useState(!!autoExecute);

    const isUnhooked = useRef(false);
    const shouldExecute = useRef(autoExecute);

    const run = useCallback(async (...taskArgs) => {
        const unhooked = isUnhooked.current;

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

        if (shouldExecute.current && strictAutoExecute) {
            // shouldExecute.current is also set to true, when run is 
            // invoked in certain situations or when autoExecute is true
            //
            // when shouldExecute.current and strictAutoExecute is true,
            // any task change should not trigger run automatically.
            // Since shouldExecute.current is controlling the execution
            // of run, we set it to false.
            //
            // When autoExecute is false, shouldExecute.current is
            // already false, and hence will not execute run on change
            // of run, irrespective of strictAutoExecute.
            //
            // When strictAutoExecute is false, run should be
            // automatically executed on change of run and we shouldn't
            // set shouldExecute.current to false

            shouldExecute.current = false;
        }

        if (!shouldExecute.current && !strictAutoExecute) {
            // When autoExecute is false and strictAutoExecute is false,
            // changes to run should trigger run automatically.
            // As shouldExecute.current is set to false initially due to autoExecute
            // being false, we change it to true.
            shouldExecute.current = true;
        }
    }, [run, strictAutoExecute]);

    useEffect(() => () => {
        isUnhooked.current = true;
    }, []);

    return {
        data,
        loading,
        error,
        taskResult,
        execute: run,
    };
};

export default useAsync;
