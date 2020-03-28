import React from 'react';
export class TabController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active_tab: null
        };
    }
    // static getDerivedStateFromProps(props, state) {

    // }
    componentDidUpdate(prevProps, prevState) {
        (async () => {
            let state = this.state;
            let didStateUpdate = false;
            //Update the stored active tab
            if (prevProps.active_tab_id !== this.props.active_tab_id) {
                state.active_tab = this.getActiveTab();
            }
            //Re-render
            if(didStateUpdate) {
                await new Promise((resolve, reject) => {
                    this.setState(state, () => resolve());
                });
            }
        })();
    }
    render() {
        let { tabs } = this.props;
        let active_tab = this.getActiveTab();
        let tab_content = active_tab.content;
        let tab_heads = tabs.map((tab, idx) => {
            let activeClass = tab.id === active_tab.id ? 'tab-active' : '';
            return (
                <button
                    className={`${activeClass} no-outline subtle`}
                    key={idx}
                    onClick={() => this.activateTab(tab)}>
                    {tab.header}
                </button>
            );
        });
        return <div className="h-100 m-0" style={{ display: 'flex', flexDirection: 'column' }}>

            <div style={{ backgroundColor: '#363A43' }}>
                {tab_heads}
            </div>
            <div
                className="w-100"
                style={{ backgroundColor: '#363A43', flex: '1', margin: 'auto' }}>
                <div className="h-100" style={{ display: 'flex' }}>
                    {tab_content}
                </div>
            </div>
        </div>
    }

    activateTab(tab) {
        let { onTabClicked = () => { } } = this.props;
        this.setState({ active_tab: tab });
        onTabClicked(tab);
    }

    getActiveTab() {
        let { active_tab } = this.state;
        let { tabs, active_tab_id } = this.props;
        for (let tab of tabs) {
            if (tab.id === active_tab_id) {
                return tab;
            }
        }
        return active_tab;
    }
}
export default TabController;