// @ts-nocheck 
import React, { Component } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import apiKey from './apiKey';
class App extends Component {
  constructor() {
    super();
    this.state = {
      selected: Array(47).fill(false),
      prefectures: {},
      series: []
    };
    this._changeSelection = this._changeSelection.bind(this);
  }

  componentDidMount() {
    fetch('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
      headers: { 'X-API-KEY': apiKey }
    })
      .then(response => response.json())
      .then(res => {
        this.setState({ prefectures: res.result });
      });
  }

  _changeSelection(index) {
    const selected_copy = this.state.selected.slice();
    selected_copy[index] = !selected_copy[index];

    if (!this.state.selected[index]) {
      fetch(
        `https://opendata.resas-portal.go.jp/api/v1/population/sum/perYear?cityCode=-&prefCode=${index +
          1}`,
        {
          headers: { 'X-API-KEY': apiKey }
        }
      )
        .then(response => response.json())
        .then(res => {
          let tmp = [];
          Object.keys(res.result.line.data).forEach(i => {
            tmp.push(res.result.line.data[i].value);
          });
          const res_series = {
            name: this.state.prefectures[index].prefName,
            data: tmp
          };
          this.setState({
            selected: selected_copy,
            series: [...this.state.series, res_series]
          });
        });
    } else {
      const series_copy = this.state.series.slice();
      for (let i = 0; i < series_copy.length; i++) {
        if (series_copy[i].name === this.state.prefectures[index].prefName) {
          series_copy.splice(i, 1);
        }
      }
      this.setState({
        selected: selected_copy,
        series: series_copy
      });
    }
  }

  renderItem(props) {
    return (
      <div
        key={props.prefCode}
        style={{ margin: '5px', display: 'inline-block' }}
      >
        <input
          type="checkbox"
          checked={this.state.selected[props.prefCode - 1]}
          onChange={() => this._changeSelection(props.prefCode - 1)}
        />
        {props.prefName}
      </div>
    );
  }

  render() {
    const obj = this.state.prefectures;
    const options = {
      title: {
        text: '人口増減率'
      },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
          pointInterval: 5,
          pointStart: 1965
        }
      },
      series: this.state.series
    };
    return (
      <div>
        {Object.keys(obj).map(i => this.renderItem(obj[i]))}
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  }
}

export default App;