import Resolver from './util/resolver';
import { ROOT_ELEMENT } from './util/config';

const App = Ember.Application.create({
	rootElement: ROOT_ELEMENT,
	Resolver
});

import routeMap from './router';
App.Router.map(routeMap);

export default App;