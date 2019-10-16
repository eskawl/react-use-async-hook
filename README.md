## React Hook for async tasks

Perform async tasks like calling your API and manage them through react hooks


### Installing

Using NPM:

```bash
npm i react-use-async
```

Using yarn:

```bash
yarn add react-use-async
```

### Usage

This hooks takes the following options:

- `task`: A function which gets performs the async task.
- `dataLoader`: A function which extracts the required data from the async task.
For example, we may not need the whole response object from the API response,
but just the data that is returned by the API.
- `initialData`: The place holder data to be used in place of the original data
until the data is fetched from the async task.

This hook return an object containing:

- `data`: The data that is returned by the async task. This is obtained by passing this
value to the the `dataLoader`.
- `loading`: Boolean indicating if the async task is still in progress.
- `error`: The error that occurred during the async task.
- `taskResult`: The whole returned value from the async task.  

### Example
```js
import useAsync from 'react-use-async'

function List(props){
    const makeAPICall = useCallback(()=>{
        // Simulated API call
        return new Promise(() => {
            setTimeout(() => {
                return {
                    data: [1,2,3]
                }
            }, 3000);
        })
    }, []);

    let {
        data, loading, error
    } = useAsync({
        task: makeAPICall,
        dataLoader: useCallback((response) => {
            return response.data;
        }, [])
    });

    return (
        <>
            {
                loading ? <div>Loading</div> : (
                    error ? <div>{error}</div> : (
                        <ul>
                            {data.map(x => <li>{x}</li>)}
                        </ul>
                    )
                )
            }
        </>
    )
}
```


