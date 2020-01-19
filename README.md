## React Hook for async tasks

Perform async tasks like calling your API and manage them through react hooks


### Installing

Using NPM:

```bash
npm i react-use-async-hook
```

Using yarn:

```bash
yarn add react-use-async-hook
```

### Usage

This hooks takes the following options:

- `task`: (required) A function which gets performs the async task.
- `dataLoader`: (optional) A function which extracts the required data from the async task.
For example, we may not need the whole response object from the API response,
but just the data that is returned by the API.
- `initialData`: (optional, defaults to null) The place holder data to be used in place of the original data
until the data is fetched from the async task.
- `autoExecute`: (optional, defaults to true) Should the task execute everytime with the useEffect hook is executed.
- `onError`: (optional) This function is called when an error occurs. The default behavior just logs to the console.

This hook return an object containing:

- `data`: The data that is returned by the async task. This is obtained by passing this
value to the the `dataLoader`.
- `loading`: Boolean indicating if the async task is still in progress.
- `error`: The error that occurred during the async task.
- `taskResult`: The whole returned value from the async task.  
- `execute`: A function that can be called to execute the task when ever needed.

### Example
```js
import useAsync from 'react-use-async'

function List (props){
  const makeAPICall = useCallback((page)=>{
      // Simulated API call
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve({
                  data: [1,2,3],
                  page,
              })
          }, 3000);
      })
  }, []);

  let {
      data, loading, error, execute: refresh
  } = useAsync({
      task: makeAPICall,
      dataLoader: useCallback((response) => {
          return response.data;
      }, []),
      initialData: useMemo(()=>([]), []),
  });

  return (
      <>
        {
          loading ? (
            <>
              <div>Loading...</div>
            </>
          ) : (
            <div>
              <button type="button" onClick={() => refresh(1)}>Refresh</button>
              {data.map(x => <div key={x}>{x}</div>)}
            </div>
          )
        }
      </>
  )
}
```


