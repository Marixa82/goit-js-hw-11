import axios from 'axios';
import Notiflix from 'notiflix';

export async function getData(inputValue, page = 1) {
    try {
        const response = await axios.get('https://pixabay.com/api/', {
            params: {
                key: '37602410-6b8217f70cb955aee1a8b2f66',
                q: inputValue,
                image_type: 'photo',
                orientation: 'horizontal',
                safesearch: true,
                per_page: 40,
                page: page,
            },
        });

        return response.data;
    } catch (error) {
        Notiflix.Notify.failure(
            'An error occurred while fetching the images. Please try again.'
        );
    }
}