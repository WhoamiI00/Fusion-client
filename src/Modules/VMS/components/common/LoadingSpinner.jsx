import { Loader, Center } from "@mantine/core";

function LoadingSpinner() {
  return (
    <Center py="xl">
      <Loader type="dots" />
    </Center>
  );
}

export default LoadingSpinner;
