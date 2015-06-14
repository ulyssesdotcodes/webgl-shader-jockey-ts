# WebGL Shader Jockey (ts Edition)

## Visualizations

These are the backbone of the application. There is a class for each visualization, and each visualization handles all of its uniforms.

`BaseVisualization` - The base of any visualization. Handles updating the sources. It has to be extended and `meshObservable()` must be overwritten.

`SimpleVisualization` - A simple mapping of frequency data to white bars.

## VisualizationManager

The `VisualizationManager` handles mapping the name of a visualization to its appropriate Visualization.
