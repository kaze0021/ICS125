package com.example.myapplication.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.myapplication.databinding.FragmentHomeBinding

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Initialize the ViewModel with the fragment's lifecycle
        val homeViewModel = ViewModelProvider(this)[HomeViewModel::class.java]

        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        val root: View = binding.root

        // Setup the button click listener
        binding.button.setOnClickListener {
            // Get the text from "How are you feeling today?" input
            val userInput = binding.textInputEditText.text?.toString() ?: ""

            // Append this text to the "Users：" field
            // Assuming 'autoCompleteTextView2' is where you want to append user input
            val currentUsersText = binding.autoCompleteTextView2.text.toString()
            binding.autoCompleteTextView2.setText("$currentUsersText$userInput\n") // Add a newline for better formatting

            // Display a specific text in the "AI:" field
            // Assuming 'multiAutoCompleteTextView' is where you want to display AI response
            binding.multiAutoCompleteTextView.setText("Your AI Response")

            // Clear the input field for next input
            binding.textInputEditText.text = null
        }

        return root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
