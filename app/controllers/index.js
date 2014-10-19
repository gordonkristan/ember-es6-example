export default Ember.ArrayController.extend({

	selectedColor: null,

	style: function() {
		return `color: ${this.get('selectedColor')};`;
	}.property('selectedColor'),

	randomizeColor: function() {
		const randomIndex = Math.floor(Math.random() * this.get('length'));
		this.set('selectedColor', this.objectAt(randomIndex));
	}.observes('[]').on('init'),

	actions: {
		changeColor() {
			this.randomizeColor();
		}
	}

});