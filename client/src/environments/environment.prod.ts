let BASE_PATH = "http://ec2-13-212-83-240.ap-southeast-1.compute.amazonaws.com:5000";
let BASE_IMG="http://ec2-13-212-83-240.ap-southeast-1.compute.amazonaws.com:5000";
let SOCKET_PATH="http://ec2-13-212-83-240.ap-southeast-1.compute.amazonaws.com:5001";

export const environment = {
  production: true,
  api_url: `${BASE_PATH}`,
  image_url: `${BASE_IMG}`,
  socket_url:`${SOCKET_PATH}`
};
