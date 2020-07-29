/* eslint import/no-unresolved: [2, { ignore: ['^react$'] }] */
import {
    useState, useEffect, useRef, useCallback,
} from 'react';

const identity = (x) => x;

const defaultConfig = {
    dataLoader: identity,
    executeOnLoad: true,
    executeOnChange: true,
    initialData: null,
    onError: (error) => {
        // eslint-disable-next-line no-console
        console.error(error);
    },
};

const configAliases = {
    autoExecute: 'executeOnLoad',
};

const mergeConfig = (config, defaults) => {
    const result = {
        ...config,
    };

    Object.entries(configAliases).forEach(([keyToBeAliased, alias]) => {
        if (keyToBeAliased in result) {
            if (alias in result) {
                // Both alias and keyToBeAlias are given
                delete result[keyToBeAliased];
                return;
            }
            result[alias] = result[keyToBeAliased];
            delete result[keyToBeAliased];
        }
    });

    Object.entries(defaults).forEach(([key, value]) => {
        if (!(key in result)) {
            result[key] = value;
        }
    });

    return result;
};

const useAsync = (config) => {
    const {
        task, dataLoader, initialData, executeOnLoad, onError, executeOnChange,
    } = mergeConfig(config, defaultConfig);

    const [data, setData] = useState(initialData);
    const [error, setError] = useState('');
    const [taskResult, setTaskResult] = useState(null);

    const [loading, setLoading] = useState(!!executeOnLoad);

    const isUnhooked = useRef(false);
    const shouldExecute = useRef(executeOnLoad);

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

        if (shouldExecute.current && !executeOnChange) {
            // when shouldExecute.current is true and executeOnChange is false,
            // any task change should not trigger run automatically.
            // Since shouldExecute.current is controlling the execution
            // of run, we set it to false.
            //
            // When executeOnLoad is false, shouldExecute.current is
            // already false, and hence will not execute run on change
            // of run, irrespective of executeOnChange.
            //
            // When executeOnChange is true, run should be
            // automatically executed on change of run and we shouldn't
            // set shouldExecute.current to false

            shouldExecute.current = false;
        }

        if (!shouldExecute.current && executeOnChange) {
            // When executeOnLoad is false and executeOnChange is true,
            // changes to run should trigger run automatically.
            // As shouldExecute.current is set to false initially due to executeOnLoad
            // being false, we change it to true.
            shouldExecute.current = true;
        }
    }, [run, executeOnChange]);

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
