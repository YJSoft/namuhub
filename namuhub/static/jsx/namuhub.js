var ContribBoxItem = React.createClass({
    render: function() {
        var stateString = this.props.data.changes.toString(),
            stateClassString = 'state';
        if(this.props.data.changes > 0) {
            stateString = '+' + stateString;
            stateClassString += ' state-more';
        } else if(this.props.data.changes == 0) {
            stateClassString += ' state-keep';
        } else {
            stateClassString += ' state-less';
        }

        var revertString = '';
        if(this.props.data.revert) {
            revertString = ' (refs #' + this.props.data.revert.toString() + ')';
        }

        var hrefString = 'https://namu.wiki/wiki/' + encodeURIComponent(this.props.data.document);
        var diffString = 'https://namu.wiki/diff/' + encodeURIComponent(this.props.data.document) + '?rev=' + this.props.data.revision.toString() + 
                         '&oldrev=' + (this.props.data.revision - 1).toString();

        var timeObject = moment(this.props.data.when);
        var timeString = timeObject.format('YYYY-MM-DD h:mm:ss a');
        var timeShortenString = timeObject.fromNow();

        return (
            <li>
                <a href={diffString} target="_blank"><span className={stateClassString}>{stateString}</span></a>
                <span className="num">#{this.props.data.revision}{revertString}</span>
                <a href={hrefString} target="_blank" className="link">{this.props.data.document}</a>
                <time title={timeString}>{timeShortenString}</time>
                <span className="cmeta">
                    {this.props.data.desc ? this.props.data.desc : '-'}
                </span>
            </li>
        );
    }
});

var ContribBox = React.createClass({
    getInitialState: function() {
        return {
            loaded: false,
            totalContribs: 0,
            yearContribs: 0,
            monthContribs: 0,
            longestStreak: 0,
            currentStreak: 0,
            detailsDate: '날짜를 선택하세요',
            details: [],
        };
    },

    componentWillReceiveProps: function(props) {
        if(props.data !== null && props.data !== this.props.data) {
            // set state
            var self = this;
            this.setState({loaded: false});

            // start date (365 days ago)
            // first day of month
            var startDate = new Date(), firstDay = new Date();
            startDate.setDate(startDate.getDate() - 365);
            firstDay.setDate(1);

            // group items to calculate statistics
            var merged = $.map(props.data, function(obj) {return obj}).sort(function(a, b) {
                return a.when > b.when ? 1 : -1;
            });

            // calculate and apply
            this.setState({
                totalContribs: merged.length,
                yearContribs: $(merged).filter(function(_, obj) {
                    return obj.when > +startDate;
                }).length,
                monthContribs: $(merged).filter(function(_, obj) {
                    return obj.when > +firstDay;
                }).length,
            });

            // calculate streaks
            // ye I know, too dirty code
            var _lastDay = null, _nextDay = null;
            var _longest = 0, _longestTemp = 0;
            $(merged).each(function(_, obj) {
                var date = moment(obj.when);
                if(date.isSame(_lastDay, 'day')) return;

                if(date.isSame(_nextDay, 'day')) {
                    _longestTemp++;
                    if(_longestTemp > _longest) {
                        _longest = _longestTemp;
                    }
                } else {
                    _longestTemp = 1;
                }

                _lastDay = date;
                _nextDay = moment(date).add(1, 'd');
            });
            var _lastDay = null, _yesterDay = null;
            var _current = 0, _break = false;
            $(merged.reverse()).each(function(i, obj) {
                if(_break) return;
                var date = moment(obj.when);
                if(i == 0 && !date.isSame(moment(), 'day')) {
                    _break = true;
                    return;
                } else if(i == 0 && date.isSame(moment(), 'day')) {
                    _current = 1;
                }
                if(date.isSame(_lastDay, 'day')) return;

                if(date.isSame(_yesterDay, 'day')) {
                    _current++;
                } else if(_yesterDay != null) {
                    _break = true;
                    return;
                }

                _lastDay = date;
                _yesterDay = moment(date).add(-1, 'd');
            });

            this.setState({
                longestStreak: _longest,
                currentStreak: _current,
            });

            // clear existing calendar
            cal = new CalHeatMap();
            $('#cal').html('');

            // re-arrange data
            var data = {};
            $.each(props.data, function(date, items) {
                date = +new Date(date) / 1000 | 0;
                data[date] = items.length;
            });

            // draw calendar
            cal.init({
                itemSelector: '#cal',
                domain: 'month',
                subDomain: 'day',
                range: 13,
                start: startDate,
                data: data,
                tooltip: true,
                legendHorizontalPosition: 'left',
                onComplete: function() {
                    setTimeout(function() {
                        $('#contrib, #cal').css('width', $('#cal > svg').width());
                        self.setState({loaded: true});
                    }, 15);
                },
                onClick: function(date, _) {
                    self.onClickDate(moment(date).format('YYYY-MM-DD'));
                },
            });
        }
    },

    onClickDate: function(date) {
        var items = this.props.data[date] || [];
        this.setState({
            detailsDate: date,
            details: items,
        });
    },

    onChangeRange: function(value, text, $selectedItem) {
        var startDate = moment().add(-parseInt(value), 'd');
        var detailsDate = startDate.format('YYYY/MM/DD') + '-' + moment().format('YYYY/MM/DD');
        var items = $.map(this.props.data, function(obj) {return obj}).filter(function(obj) {
            return obj.when > +startDate;
        }).sort(function(a, b) {
            return a.when > b.when ? 1 : -1;
        }).reverse();

        this.setState({
            detailsDate: detailsDate,
            details: items,
        });
    },

    componentDidMount: function() {
        $('.ui.dropdown').dropdown();

        $('.ui.buttons .dropdown.button').dropdown({
            action: 'combo',
            onChange: this.onChangeRange,
        });
    },

    render: function() {
        var contribClassString = 'ui center';
        if(!this.state.loaded) {
            contribClassString += ' hide';
        }

        return (
            <div id="contrib" className={contribClassString}>
                <div id="cal"></div>
                <div className="ui divider"></div>
                <div className="summary clearfix">
                    <div>총 기여 <span>{this.state.totalContribs}</span></div>
                    <div>올해 기여 <span>{this.state.yearContribs}</span></div>
                    <div>이번달 기여 <span>{this.state.monthContribs}</span></div>
                    <div>최장 연속기여 (일) <span>{this.state.longestStreak}</span></div>
                    <div>현재 연속기여 (일) <span>{this.state.currentStreak}</span></div>
                </div>
                <div className="ui divider"></div>
                <div id="detailsTitle" className="clearfix">
                    <span className="title"><strong>{this.state.details.length}</strong>번의 기여 - {this.state.detailsDate}</span>
                    <div className="ui buttons">
                        <button className="ui tiny button">기간</button>
                        <div className="ui tiny floating dropdown icon button" tabindex="-1">
                            <i className="dropdown icon"></i>
                            <div className="menu transition hidden" tabindex="-1">
                                <div className="item" data-value="7">7일</div>
                                <div className="item" data-value="30">30일</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ui divider"></div>
                <div id="details">
                    <ul>
                        {this.state.details.map(function(detail) {
                            return <ContribBoxItem data={detail} />;
                        })}
                    </ul>
                </div>
            </div>
        );
    }
});

var SearchBox = React.createClass({
    getInitialState: function() {
        return {
            user: this.props.user || ''  
        };
    },

    submit: function(e) {
        var uri = '/' + this.state.user;
        e.preventDefault();

        if(this.props.loading) {
            alert('이미 불러오는 중입니다.');
            return;
        }

        var ps = history.pushState ? 1 : 0;
        [function(){location.replace(uri)},function(){history.pushState(null,null,uri)}][ps]();

        this.props.onSubmit(this.state.user);
    },

    updateUser: function(e) {
        this.setState({
            user: e.target.value
        });
    },

    componentDidMount: function() {
        if(this.state.user) {
            this.props.onSubmit(this.state.user);
        }
    },

    render: function() {
        var btnClassString = 'ui teal button ';
        if(this.props.loading) {
            btnClassString += 'loading';
        }

        return (
            <form className="ui" onSubmit={this.submit}>
                <div className="ui action center aligned input">
                    <input type="text" disabled={this.props.loading} placeholder="나무위키 아이디 입력" defaultValue={this.props.user} onChange={this.updateUser} />
                    <button className={btnClassString}>조회</button>
                </div>
            </form>
        );
    }
});
