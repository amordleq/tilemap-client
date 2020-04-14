import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        type: 'dark'
    },
    typography: {
        fontSize: 12
    },
    overrides: {
        MuiPaper: {
            root: {
                backgroundColor: 'hsla(0, 0%, 26%, 0.9)'
            }
        }
    }
});

export default theme;