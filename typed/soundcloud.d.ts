interface SC {
  get(path: string, params: SCRequest, callback: (response: SCResponse) => void)
}

declare var SC;

interface SCRequest {
  url: string
}

declare var SCRequest;

interface SCResponse{
  kind?: string;

  errors?: Array<string>;

  stream_url?: string;

  tracks?: Array<SCResponse>;
}

declare var SCResponse;
