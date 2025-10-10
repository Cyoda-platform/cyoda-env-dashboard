export const childrenLayout = {
    name: 'grid',
    nodeDimensionsIncludeLabels: true,
    padding: 10,
};

export const coreLayout = (name = 'breadthfirst') => ({
    name,
    directed: true,
    nodeDimensionsIncludeLabels: true,
    padding: 10,
});
